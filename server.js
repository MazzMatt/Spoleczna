import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { initDb, saveContactMessage, getContactMessages, checkHealth } from './db.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serwowanie plików statycznych (HTML, CSS, JS, Assets)
app.use(express.static(__dirname));

// Endpoint weryfikacji zdrowia połączenia z bazą danych Neon
app.get('/api/health', async (req, res) => {
  try {
    const health = await checkHealth();
    res.json({
      status: 'ok',
      service: 'Pierwsza Społeczna Szkoła Podstawowa w Chełmie - Backend',
      database: {
        provider: 'Neon Lakebase Postgres',
        branch: process.env.NEON_BRANCH || 'production',
        time: health.current_time,
        version: health.version
      }
    });
  } catch (err) {
    console.error('[API Health] Błąd połączenia z bazą:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Endpoint zapisu formularza kontaktowego w bazie Neon Postgres
app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Pola: Imię i nazwisko, E-mail oraz Wiadomość są wymagane.'
      });
    }

    const saved = await saveContactMessage({
      name: name.trim(),
      phone: (phone || '').trim(),
      email: email.trim(),
      subject: (subject || 'Zapytanie ze strony').trim(),
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Wiadomość została pomyślnie zapisana w bazie danych szkoły (Neon Postgres).',
      data: saved
    });
  } catch (err) {
    console.error('[API Contact] Błąd zapisu wiadomości:', err);
    res.status(500).json({
      success: false,
      error: 'Błąd zapisu w bazie danych. Spróbuj ponownie później.'
    });
  }
});

// Endpoint odczytu wiadomości kontaktowych
app.get('/api/contact', async (req, res) => {
  try {
    const messages = await getContactMessages(50);
    res.json({ success: true, count: messages.length, messages });
  } catch (err) {
    console.error('[API Contact] Błąd pobierania wiadomości:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint pobierania galerii (proxy do Strapi lub fallback)
app.get('/api/galerias', async (req, res) => {
  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
  try {
    const strapiRes = await fetch(`${strapiUrl}/api/galerias?populate=*`);
    if (strapiRes.ok) {
      const data = await strapiRes.json();
      return res.json(data);
    }
  } catch (err) {
    // Strapi nie jest jeszcze uruchomione lokalnie
  }
  res.json({ data: [] });
});

// Obsługa tras dla podstron HTML (fallback dla tras innych niż API)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  if (req.method !== 'GET') return next();
  const requestedFile = req.path.endsWith('.html') ? req.path : `${req.path}.html`;
  const filePath = path.join(__dirname, requestedFile);
  res.sendFile(filePath, (err) => {
    if (err) res.sendFile(path.join(__dirname, 'index.html'));
  });
});

async function startServer() {
  try {
    console.log('[Neon] Inicjalizacja połączenia z bazą Lakebase Postgres...');
    await initDb();
    console.log('[Neon] Połączono z bazą danych Neon pomyślnie (tabele zweryfikowane).');
  } catch (err) {
    console.warn('[Neon] Ostrzeżenie przy inicjalizacji bazy danych:', err.message);
  }

  const server = app.listen(PORT, () => {
    console.log(`[Serwer] Aplikacja działa na http://localhost:${PORT}`);
    console.log(`[Neon] Aktywna gałąź bazy: ${process.env.NEON_BRANCH || 'production'}`);
  });

  return server;
}

const isDirectExecution = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isDirectExecution) {
  startServer();
}

export { app, startServer };
export default app;
