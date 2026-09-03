import type { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { ApiError } from '../middleware/errorHandler.js';
import { streamChatCompletion, type ChatMessage } from '../services/openrouter.service.js';

const sendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  modelId: z.string().min(1),
  message: z.string().min(1),
});

export async function listConversations(req: Request, res: Response) {
  const result = await pool.query(
    `SELECT id, title, model_id, updated_at FROM conversations
     WHERE user_id = $1 AND is_archived = FALSE
     ORDER BY updated_at DESC`,
    [req.user!.id],
  );
  res.json({ conversations: result.rows });
}

export async function getConversation(req: Request, res: Response) {
  const { id } = req.params;

  const convo = await pool.query(
    'SELECT id, title, model_id FROM conversations WHERE id = $1 AND user_id = $2',
    [id, req.user!.id],
  );
  if (!convo.rowCount) {
    throw new ApiError(404, 'Conversation not found');
  }

  const messages = await pool.query(
    'SELECT id, role, content, created_at FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [id],
  );

  res.json({ conversation: convo.rows[0], messages: messages.rows });
}

/**
 * Sends a message and streams the assistant's reply back as SSE.
 * Creates the conversation on first message if conversationId is omitted.
 */
export async function sendMessage(req: Request, res: Response) {
  const { conversationId, modelId, message } = sendMessageSchema.parse(req.body);
  const userId = req.user!.id;

  let convoId = conversationId;
  if (!convoId) {
    const created = await pool.query(
      `INSERT INTO conversations (user_id, title, model_id) VALUES ($1, $2, $3) RETURNING id`,
      [userId, message.slice(0, 60), modelId],
    );
    convoId = created.rows[0].id;
  } else {
    const owned = await pool.query('SELECT id FROM conversations WHERE id = $1 AND user_id = $2', [
      convoId,
      userId,
    ]);
    if (!owned.rowCount) {
      throw new ApiError(404, 'Conversation not found');
    }
  }

  await pool.query(`INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'user', $2)`, [
    convoId,
    message,
  ]);

  const history = await pool.query(
    'SELECT role, content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC',
    [convoId],
  );
  const chatMessages: ChatMessage[] = history.rows.map((row) => ({
    role: row.role,
    content: row.content,
  }));

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.write(`event: conversation\ndata: ${JSON.stringify({ conversationId: convoId })}\n\n`);

  let fullReply = '';
  try {
    await streamChatCompletion(modelId, chatMessages, (raw) => {
      fullReply += extractDeltaText(raw);
      res.write(`data: ${JSON.stringify({ delta: raw })}\n\n`);
    });
  } catch (err) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: (err as Error).message })}\n\n`);
    res.end();
    return;
  }

  if (fullReply.trim()) {
    await pool.query(`INSERT INTO messages (conversation_id, role, content) VALUES ($1, 'assistant', $2)`, [
      convoId,
      fullReply,
    ]);
  }
  await pool.query('UPDATE conversations SET updated_at = now() WHERE id = $1', [convoId]);

  res.write('event: done\ndata: {}\n\n');
  res.end();
}

/** Best-effort parse of OpenRouter's SSE delta chunks to accumulate the full reply text. */
function extractDeltaText(raw: string): string {
  let text = '';
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const payload = line.slice(6).trim();
    if (payload === '[DONE]') continue;
    try {
      const json = JSON.parse(payload);
      text += json.choices?.[0]?.delta?.content ?? '';
    } catch {
      // Ignore partial/non-JSON chunks; they'll be completed on the next read.
    }
  }
  return text;
}
