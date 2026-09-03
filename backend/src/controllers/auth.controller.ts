import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { ApiError } from '../middleware/errorHandler.js';
import { signToken } from '../services/token.service.js';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function register(req: Request, res: Response) {
  const { email, password } = credentialsSchema.parse(req.body);

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash) VALUES ($1, $2)
     RETURNING id, email, role`,
    [email, passwordHash],
  );

  const user = result.rows[0];
  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.status(201).json({ token, user });
}

export async function login(req: Request, res: Response) {
  const { email, password } = credentialsSchema.parse(req.body);

  const result = await pool.query(
    'SELECT id, email, role, password_hash, is_active FROM users WHERE email = $1',
    [email],
  );
  const user = result.rows[0];

  if (!user || !user.password_hash) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.is_active) {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
}

export async function me(req: Request, res: Response) {
  const result = await pool.query(
    'SELECT id, email, display_name, avatar_url, role, created_at FROM users WHERE id = $1',
    [req.user!.id],
  );
  if (!result.rowCount) {
    throw new ApiError(404, 'User not found');
  }
  res.json({ user: result.rows[0] });
}
