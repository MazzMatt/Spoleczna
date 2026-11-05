#!/usr/bin/env node
import dotenv from 'dotenv';
import { sql, initDb, saveContactMessage, getContactMessages, checkHealth } from '../db.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

async function runTest() {
  console.log('============================================================');
  console.log('🧪 TEST END-TO-END USŁUGI NEON POSTGRES (LAKEBASE POSTGRES)');
  console.log('============================================================\n');

  try {
    // 1. Sprawdzenie zmiennych środowiskowych
    console.log('1. Sprawdzanie konfiguracji środowiskowej:');
    if (!process.env.DATABASE_URL) {
      throw new Error('Brak zmiennej DATABASE_URL w .env.local lub środowisku!');
    }
    console.log('   ✅ DATABASE_URL: zdefiniowany (Neon Postgres)');
    console.log(`   ✅ NEON_BRANCH:  ${process.env.NEON_BRANCH || 'production'}\n`);

    // 2. Weryfikacja połączenia i wersji bazy
    console.log('2. Test zapytania do bazy danych:');
    const health = await checkHealth();
    console.log(`   ✅ Czas serwera bazy: ${health.current_time}`);
    console.log(`   ✅ Wersja Postgres:   ${health.version.split(' on ')[0]}\n`);

    // 3. Inicjalizacja schematu tabel
    console.log('3. Inicjalizacja i weryfikacja tabel schematu:');
    await initDb();
    console.log('   ✅ Tabela contact_messages: istnieje / utworzona');
    console.log('   ✅ Tabela site_metrics:    istnieje / utworzona\n');

    // 4. Test zapisu (INSERT)
    console.log('4. Test zapisu rekordu (INSERT):');
    const testPayload = {
      name: 'Test Neon E2E',
      phone: '82 565 45 54',
      email: 'test@spoleczna.chelm.pl',
      subject: 'Automated Neon Verification',
      message: 'Wiadomość testowa weryfikująca integrację z bazą Neon Postgres.'
    };
    const saved = await saveContactMessage(testPayload);
    console.log(`   ✅ Rekord zapisany pomyślnie! ID: ${saved.id}, Data: ${saved.created_at}\n`);

    // 5. Test odczytu (SELECT)
    console.log('5. Test odczytu rekordu (SELECT):');
    const messages = await getContactMessages(5);
    const found = messages.find(m => m.id === saved.id);
    if (!found) {
      throw new Error(`Nie odnaleziono właśnie zapisanego rekordu o ID ${saved.id}!`);
    }
    console.log(`   ✅ Odczytano rekord: "${found.subject}" od ${found.name} (${found.email})\n`);

    // 6. Czyszczenie rekordu testowego
    console.log('6. Porządkowanie danych testowych:');
    await sql`DELETE FROM contact_messages WHERE id = ${saved.id};`;
    console.log(`   ✅ Rekord testowy o ID ${saved.id} został usunięty.\n`);

    console.log('============================================================');
    console.log('🎉 WYNIK: Wszystkie testy Neon Postgres zakończone sukcesem (PASS)!');
    console.log('============================================================');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ BŁĄD PODCZAS TESTU BAZY DANYCH:');
    console.error(err);
    console.log('\n============================================================');
    console.log('❌ WYNIK: Test Neon Postgres nie powiódł się (FAIL)!');
    console.log('============================================================');
    process.exit(1);
  }
}

runTest();
