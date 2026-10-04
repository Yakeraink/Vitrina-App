import crypto from 'crypto';

/**
 * Generates a cryptographically secure random session token (32 bytes = 256 bits).
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Computes the SHA-256 hash of a session token for secure database storage.
 * The raw token is stored in the user's HttpOnly cookie, while the database
 * only holds the hash, preventing token theft via DB leaks.
 */
export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
