import type { Request, Response } from 'express';
import { pool } from '../db/pool.js';
import { listModels } from '../services/openrouter.service.js';

/**
 * Pulls the current model catalog from OpenRouter and upserts it into
 * ai_models, so the free/paid model list stays in sync instead of being
 * hard-coded (per SOW §10).
 */
export async function syncModels(_req: Request, res: Response) {
  const models = await listModels();

  let synced = 0;
  for (const model of models) {
    const isFree = model.pricing?.prompt === '0' && model.pricing?.completion === '0';
    const supportsVision = model.architecture?.modality?.includes('image') ?? false;
    const supportsTools = model.supported_parameters?.includes('tools') ?? false;

    await pool.query(
      `INSERT INTO ai_models (id, name, provider, is_free, context_length, supports_vision, supports_tools, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         provider = EXCLUDED.provider,
         is_free = EXCLUDED.is_free,
         context_length = EXCLUDED.context_length,
         supports_vision = EXCLUDED.supports_vision,
         supports_tools = EXCLUDED.supports_tools,
         updated_at = now()`,
      [
        model.id,
        model.name,
        model.id.split('/')[0] ?? null,
        isFree,
        model.context_length ?? null,
        supportsVision,
        supportsTools,
      ],
    );
    synced += 1;
  }

  res.json({ synced });
}
