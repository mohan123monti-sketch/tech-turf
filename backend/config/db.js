import pg from 'pg';

const { Pool } = pg;

const sslEnabled = process.env.DB_SSL === 'true';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslEnabled ? { rejectUnauthorized: false } : false,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
    connectionTimeoutMillis: Number(process.env.DB_CONN_TIMEOUT_MS || 10000)
});

export async function query(text, params = []) {
    return pool.query(text, params);
}

export async function testConnection() {
    await query('SELECT 1');
}
