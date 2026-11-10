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

  const cloudUrl = 'https://spolecznachelm.duckdns.org';
  const localUrl = 'http://localhost:1337';
  const urlsToTry = [process.env.STRAPI_URL, cloudUrl, localUrl].filter(Boolean);

  let success = false;

  for (const strapiUrl of urlsToTry) {
    try {
      const endpoint = `${strapiUrl}/api/galerias?populate=*&pagination[pageSize]=100&sort=Data:desc,createdAt:desc`;
      console.log(`Pobieranie danych ze Strapi (${endpoint})...`);
      const res = await fetch(endpoint, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) {
        continue;
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
      console.log(`2. Zapisano plik danych galerii dla hostingu:`);
      console.log(`   ✅ ${jsonPath}\n`);

      // 2B. Zapis do data/gazetka.json
      try {
        const gazetkaEndpoint = `${strapiUrl}/api/gazetkas?populate=*&pagination[pageSize]=100&sort=Data:desc,createdAt:desc`;
        const gRes = await fetch(gazetkaEndpoint, { signal: AbortSignal.timeout(10000) });
        if (gRes.ok) {
          const gData = await gRes.json();
          const gJsonPath = path.join(dataDir, 'gazetka.json');
          fs.writeFileSync(gJsonPath, JSON.stringify(gData, null, 2), 'utf-8');
          console.log(`   ✅ Zapisano plik gazetka.json (${gData.data?.length || 0} wydań)\n`);
        }
      } catch (ge) {}

      // 2C. Zapis do data/aktualnosci.json
      try {
        const aktualnosciEndpoint = `${strapiUrl}/api/aktualnoscs?populate=*&pagination[pageSize]=100&sort=Data:desc,createdAt:desc`;
        const aRes = await fetch(aktualnosciEndpoint, { signal: AbortSignal.timeout(10000) });
        if (aRes.ok) {
          const aData = await aRes.json();
          const aJsonPath = path.join(dataDir, 'aktualnosci.json');
          fs.writeFileSync(aJsonPath, JSON.stringify(aData, null, 2), 'utf-8');
          console.log(`   ✅ Zapisano plik aktualnosci.json (${aData.data?.length || 0} artykułów)\n`);
        }
      } catch (ae) {}

      success = true;
      break;
    } catch (e) {
      // Próbuj kolejny URL
    }
  }

  try {
    if (!success) {
      throw new Error('Nie udało się pobrać danych z żadnego adresu Strapi.');
    }

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
