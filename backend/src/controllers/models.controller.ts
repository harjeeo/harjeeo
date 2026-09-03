import type { Request, Response } from 'express';
import { pool } from '../db/pool.js';

export async function listEnabledModels(_req: Request, res: Response) {
  const result = await pool.query(
    `SELECT id, name, provider, is_free, context_length, supports_vision, supports_tools
     FROM ai_models
     WHERE is_enabled = TRUE
     ORDER BY priority DESC, name ASC`,
  );
  res.json({ models: result.rows });
}
