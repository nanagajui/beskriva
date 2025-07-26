import bcrypt from "bcrypt";
import type { Request, Response, NextFunction } from "express";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // @ts-ignore - The `user` property is added to the session in `types/express.d.ts`,
  // but the linter is not picking it up.
  if (req.session && req.session.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
} 