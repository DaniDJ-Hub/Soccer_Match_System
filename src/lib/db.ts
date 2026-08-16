import { Pool, type QueryResultRow } from "pg";

// Reuse a single pool across hot-reloads in dev, and across invocations
// in serverless. Configure via env vars (see .env.example).
declare global {
  var _pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  return new Pool(
    connectionString
      ? { connectionString, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.DB_HOST,
          port: parseInt(process.env.DB_PORT || "5432", 10),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          ssl: { rejectUnauthorized: false },
        }
  );
}

export const pool = global._pgPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
) {
  return pool.query<T>(text, params);
}
