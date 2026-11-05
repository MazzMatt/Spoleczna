import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load .env.local first (where Neon CLI writes credentials), then fallback to .env
dotenv.config({ path: '.env.local' });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn('[Neon DB] OSTRZEŻENIE: Brak zmiennej DATABASE_URL.');
}

// Neon HTTP client - best practice for Lakebase Postgres
export const sql = connectionString ? neon(connectionString) : null;

/**
 * Inicjalizuje tabele w bazie danych Neon Postgres, jeśli jeszcze nie istnieją.
 */
export async function initDb() {
  if (!sql) throw new Error('Brak połączenia z bazą danych (DATABASE_URL)');

  // Tabela formularza kontaktowego
  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      phone VARCHAR(100),
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Tabela metryk i logów aplikacji
  await sql`
    CREATE TABLE IF NOT EXISTS site_metrics (
      id SERIAL PRIMARY KEY,
      metric_name VARCHAR(100) NOT NULL,
      value TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  return true;
}

/**
 * Zapisuje wiadomość z formularza kontaktowego w bazie Neon Postgres.
 */
export async function saveContactMessage({ name, phone, email, subject, message }) {
  if (!sql) throw new Error('Brak połączenia z bazą danych (DATABASE_URL)');
  const rows = await sql`
    INSERT INTO contact_messages (name, phone, email, subject, message)
    VALUES (${name}, ${phone}, ${email}, ${subject}, ${message})
    RETURNING id, name, email, subject, created_at;
  `;
  return rows[0];
}

/**
 * Pobiera listę wiadomości kontaktowych z bazy danych.
 */
export async function getContactMessages(limit = 50) {
  if (!sql) throw new Error('Brak połączenia z bazą danych (DATABASE_URL)');
  return await sql`
    SELECT id, name, phone, email, subject, message, created_at
    FROM contact_messages
    ORDER BY created_at DESC
    LIMIT ${limit};
  `;
}

/**
 * Sprawdza stan połączenia z bazą danych Lakebase Postgres na platformie Neon.
 */
export async function checkHealth() {
  if (!sql) throw new Error('Brak połączenia z bazą danych (DATABASE_URL)');
  const result = await sql`
    SELECT NOW() as current_time, version() as version;
  `;
  return result[0];
}
