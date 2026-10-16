import pg from "pg";

let pool;

// NETLIFY_DATABASE_URL is set automatically when the Neon database is added
// through Netlify; DATABASE_URL is for your own Neon project or local Postgres.
export function getPool() {
  if (!pool) {
    const connectionString = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;
    if (!connectionString) throw new Error("Set NETLIFY_DATABASE_URL or DATABASE_URL.");
    pool = new pg.Pool({
      connectionString,
      max: 3,
      idleTimeoutMillis: 10_000,
      // Neon sleeps when idle; the first connection can take a few seconds to wake it.
      connectionTimeoutMillis: 10_000,
    });
    pool.on("error", (err) => console.error("Idle database client error", err));
  }
  return pool;
}
