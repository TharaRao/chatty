import { sql } from '@vercel/postgres';

export async function query(text: string, params?: (string | number | null)[]) {
  try {
    const result = await sql.query(text, params);
    return result;
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

export async function queryOne(text: string, params?: (string | number | null)[]) {
  const result = await query(text, params);
  return result.rows[0];
}

export async function queryAll(text: string, params?: (string | number | null)[]) {
  const result = await query(text, params);
  return result.rows;
}
