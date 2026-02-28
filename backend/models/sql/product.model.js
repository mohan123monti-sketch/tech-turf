import { query } from '../../config/db.js';

export async function createProduct({ name, description, price, imageUrl }) {
  const { rows } = await query(
    `INSERT INTO products (name, description, price, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, description || null, price, imageUrl || null]
  );
  return rows[0];
}

export async function getAllProducts() {
  const { rows } = await query('SELECT * FROM products ORDER BY id DESC');
  return rows;
}

export async function getProductById(id) {
  const { rows } = await query('SELECT * FROM products WHERE id = $1 LIMIT 1', [id]);
  return rows[0] || null;
}

export async function updateProduct(id, payload) {
  const { name, description, price, imageUrl } = payload;
  const { rows } = await query(
    `UPDATE products
     SET name = COALESCE($2, name),
         description = COALESCE($3, description),
         price = COALESCE($4, price),
         image_url = COALESCE($5, image_url),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, name, description, price, imageUrl]
  );
  return rows[0] || null;
}

export async function deleteProduct(id) {
  const { rowCount } = await query('DELETE FROM products WHERE id = $1', [id]);
  return rowCount > 0;
}
