import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

// Support for PGlite in-memory fallback during test/zero-config environments
let pgliteInstance: unknown = null;

export async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl && !databaseUrl.includes('placeholder')) {
    try {
      client = postgres(databaseUrl, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      dbInstance = drizzle(client, { schema });
      return dbInstance;
    } catch (err) {
      console.warn('PostgreSQL connection error, falling back to embedded PGlite:', err);
    }
  }

  // Fallback to embedded PostgreSQL 16 (PGlite)
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite');

  pgliteInstance = new PGlite();
  dbInstance = drizzlePglite(pgliteInstance as import('@electric-sql/pglite').PGlite, {
    schema,
  }) as unknown as ReturnType<typeof drizzle<typeof schema>>;

  return dbInstance;
}

export function getRawClient() {
  return { client, pgliteInstance };
}

export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
  }
  if (
    pgliteInstance &&
    typeof (pgliteInstance as { close?: () => Promise<void> }).close === 'function'
  ) {
    await (pgliteInstance as { close: () => Promise<void> }).close();
    pgliteInstance = null;
  }
  dbInstance = null;
}
