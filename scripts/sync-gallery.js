#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function syncGallery() {
  console.log('============================================================');
  console.log('🔄 SYNCHRONIZACJA GALERII DLA GITHUB PAGES / HOSTINGU');
  console.log('============================================================\n');

  const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';

  try {
    console.log(`1. Pobieranie danych ze Strapi (${strapiUrl}/api/galerias?populate=*)...`);
    const res = await fetch(`${strapiUrl}/api/galerias?populate=*`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) {
      throw new Error(`Błąd połączenia ze Strapi: HTTP ${res.status}`);
    }

    const data = await res.json();
    const count = data.data?.length || 0;
    console.log(`   ✅ Pobrano ${count} ${count === 1 ? 'folder' : 'folderów'} ze Strapi.\n`);

    // 2. Zapis do data/galerie.json
    const dataDir = path.join(rootDir, 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const jsonPath = path.join(dataDir, 'galerie.json');
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`2. Zapisano plik danych dla hostingu:`);
    console.log(`   ✅ ${jsonPath}\n`);

    // 3. Kopiowanie zdjęć z backend/public/uploads do uploads/ w katalogu głównym
    const backendUploads = path.join(rootDir, 'backend', 'public', 'uploads');
    const rootUploads = path.join(rootDir, 'uploads');

    if (fs.existsSync(backendUploads)) {
      if (!fs.existsSync(rootUploads)) {
        fs.mkdirSync(rootUploads, { recursive: true });
      }

      const files = fs.readdirSync(backendUploads);
      let copiedCount = 0;

      for (const file of files) {
        if (file === '.gitkeep') continue;
        const srcFile = path.join(backendUploads, file);
        const destFile = path.join(rootUploads, file);
        if (fs.statSync(srcFile).isFile()) {
          fs.copyFileSync(srcFile, destFile);
          copiedCount++;
        }
      }
      console.log(`3. Synchronizacja zdjęć do folderu publicznego strony:`);
      console.log(`   ✅ Skopiowano ${copiedCount} plików do katalogu uploads/\n`);
    }

    console.log('============================================================');
    console.log('🎉 Sukces! Galeria jest zsynchronizowana i gotowa na GitHub Pages!');
    console.log('============================================================');
    process.exit(0);
  } catch (err) {
    const jsonPath = path.join(rootDir, 'data', 'galerie.json');
    if (fs.existsSync(jsonPath)) {
      console.log(`⚠️ Strapi nie jest aktywne w tym procesie (${err.message}).`);
      console.log(`   ✅ Zachowano istniejący plik danych: data/galerie.json\n`);
      process.exit(0);
    } else {
      console.error('❌ Błąd synchronizacji galerii:', err.message);
      process.exit(0);
    }
  }
}

syncGallery();
