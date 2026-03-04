'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('Postgres pool error:', err);
});

/**
 * Thin query wrapper — returns the full pg QueryResult.
 * Usage: const { rows } = await db.query(sql, [params]);
 */
async function query(sql, params) {
  return pool.query(sql, params);
}

module.exports = { query, pool };
