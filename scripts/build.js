#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('============================================================');
console.log('🔨 PROCES BUDOWANIA PROJEKTU: PSSP W CHEŁMIE (BUILD)');
console.log('============================================================\n');

try {
  // 1. Sprawdzenie kluczowych plików
  console.log('1. Weryfikacja plików projektu:');
  const requiredFiles = ['neon.ts', 'server.js', 'db.js', 'index.html', 'package.json'];
  for (const f of requiredFiles) {
    if (!fs.existsSync(f)) {
      throw new Error(`Brak wymaganego pliku: ${f}`);
    }
    console.log(`   ✅ ${f}`);
  }

  // 2. Walidacja składni plików JavaScript
  console.log('\n2. Walidacja składni JavaScript (node --check):');
  execSync('node --check server.js', { stdio: 'inherit' });
  execSync('node --check db.js', { stdio: 'inherit' });
  execSync('node --check js/script.js', { stdio: 'inherit' });
  console.log('   ✅ Składnia plików JavaScript poprawna.');

  // 3. Weryfikacja dostępności WCAG 2.1 AA
  console.log('\n3. Weryfikacja dostępności cyfrowej WCAG 2.1 AA:');
  execSync('python3 scripts/verify_wcag.py', { stdio: 'inherit' });

  console.log('\n============================================================');
  console.log('✅ BUILD COMPLETED SUCCESSFULLY (PROJEKT ZBUDOWANY POPRAWNIE)');
  console.log('============================================================\n');
  process.exit(0);
} catch (err) {
  console.error('\n❌ BŁĄD PODCZAS BUDOWANIA:');
  console.error(err.message || err);
  process.exit(1);
}
