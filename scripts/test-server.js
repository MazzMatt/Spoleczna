#!/usr/bin/env node
import dotenv from 'dotenv';
import { startServer } from '../server.js';
import { sql } from '../db.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

async function runServerTest() {
  console.log('============================================================');
  console.log('🚀 TEST INTEGRACYJNY SERWERA I USŁUGI NEON POSTGRES (END-TO-END)');
  console.log('============================================================\n');

  let serverInstance = null;

  try {
    // 1. Uruchomienie serwera aplikacji
    console.log('1. Uruchamianie serwera Express...');
    process.env.NODE_ENV = 'test'; // Zapobiega podwójnemu wywołaniu w server.js
    serverInstance = await startServer();
    console.log(`   ✅ Serwer działa na ${BASE_URL}\n`);

    // 2. Test endpointu GET /api/health
    console.log('2. Test GET /api/health (status bazy Neon):');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    if (!healthRes.ok) {
      throw new Error(`GET /api/health zwrócił status ${healthRes.status}`);
    }
    const healthData = await healthRes.json();
    console.log(`   ✅ Status:   ${healthData.status}`);
    console.log(`   ✅ Provider: ${healthData.database.provider}`);
    console.log(`   ✅ Branch:   ${healthData.database.branch}`);
    console.log(`   ✅ Postgres: ${healthData.database.version.split(' on ')[0]}\n`);

    // 3. Test endpointu POST /api/contact
    console.log('3. Test POST /api/contact (zapis formularza do Neon Postgres):');
    const contactPayload = {
      name: 'Jan Kowalski (Test Neon)',
      phone: '82 565 45 54',
      email: 'jan.kowalski@spoleczna.chelm.pl',
      subject: 'Rekrutacja 2026/2027',
      message: 'Dzień dobry, chciałbym zapytać o rekrutację do klasy pierwszej.'
    };

    const postRes = await fetch(`${BASE_URL}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contactPayload)
    });

    if (!postRes.ok) {
      const errBody = await postRes.text();
      throw new Error(`POST /api/contact zwrócił status ${postRes.status}: ${errBody}`);
    }
    const postData = await postRes.json();
    console.log(`   ✅ Odpowiedź API: ${postData.message}`);
    console.log(`   ✅ ID zapisanego rekordu: ${postData.data.id}\n`);

    // 4. Test endpointu GET /api/contact
    console.log('4. Test GET /api/contact (odczyt zapisanych wiadomości z bazy):');
    const getRes = await fetch(`${BASE_URL}/api/contact`);
    if (!getRes.ok) {
      throw new Error(`GET /api/contact zwrócił status ${getRes.status}`);
    }
    const getData = await getRes.json();
    console.log(`   ✅ Liczba wiadomości w bazie: ${getData.count}`);
    const found = getData.messages.find(m => m.id === postData.data.id);
    if (!found) {
      throw new Error('Nie znaleziono dodanego rekordu w liście wiadomości!');
    }
    console.log(`   ✅ Pomyślnie zweryfikowano rekord: "${found.subject}" od ${found.name}\n`);

    // 5. Czyszczenie danych testowych z Neon Postgres
    console.log('5. Czyszczenie danych testowych w Neon Postgres:');
    if (sql) {
      await sql`DELETE FROM contact_messages WHERE id = ${postData.data.id};`;
      console.log(`   ✅ Usunięto rekord testowy ID: ${postData.data.id}\n`);
    }

    console.log('============================================================');
    console.log('🎉 WYNIK: Wszystkie endpointy i usługi Neon działają wzorowo!');
    console.log('============================================================');

    if (serverInstance && serverInstance.close) {
      serverInstance.close();
    }
    process.exit(0);
  } catch (err) {
    console.error('\n❌ BŁĄD PODCZAS TESTU SERWERA:', err);
    if (serverInstance && serverInstance.close) {
      serverInstance.close();
    }
    process.exit(1);
  }
}

runServerTest();
