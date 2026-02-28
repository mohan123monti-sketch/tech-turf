import { query } from '../../config/db.js';

export async function createUser({ name, email, passwordHash, role = 'user' }) {
  const sql = `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
  `;
  const { rows } = await query(sql, [name, email.toLowerCase(), passwordHash, role]);
  return rows[0];
}

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1 LIMIT 1',
    [id]
  );
  return rows[0] || null;
}

export async function listUsers(limit = 100, offset = 0) {
  const { rows } = await query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  return rows;
}
