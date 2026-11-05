import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { sql } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const uploadsDir = path.join(projectRoot, 'backend', 'public', 'uploads');

cloudinary.config({
  cloud_name: 'zpylz0ih',
  api_key: '286117754568249',
  api_secret: 'kHU56bceO01To5-NxsArdp5dEuo'
});

async function migrate() {
  console.log('Rozpoczynam migrację lokalnych zdjęć do Cloudinary...');

  // Pobierz tylko pliki powiązane z galeriami lub wszystkie lokalne
  const files = await sql`
    SELECT f.* FROM files f
    WHERE f.provider = 'local'
    ORDER BY f.id ASC
  `;

  console.log(`Znaleziono ${files.length} plików do zmigrowania.`);

  let migratedCount = 0;

  for (const file of files) {
    console.log(`\nPrzetwarzanie pliku #${file.id}: "${file.name}"...`);

    const localFileName = `${file.hash}${file.ext}`;
    const localFilePath = path.join(uploadsDir, localFileName);

    if (!fs.existsSync(localFilePath)) {
      console.warn(`  ⚠️ Nie znaleziono pliku lokalnego: ${localFilePath}`);
      continue;
    }

    try {
      // 1. Upload głównego pliku do Cloudinary
      const mainUpload = await cloudinary.uploader.upload(localFilePath, {
        folder: 'spoleczna/galerie',
        public_id: file.hash,
        overwrite: true,
        resource_type: 'image'
      });

      console.log(`  ✅ Wgrano oryginał: ${mainUpload.secure_url}`);

      // 2. Upload poszczególnych formatów (thumbnail, small, medium, large)
      let formats = file.formats;
      if (typeof formats === 'string') {
        try {
          formats = JSON.parse(formats);
        } catch (e) {
          formats = null;
        }
      }

      if (formats && typeof formats === 'object') {
        for (const [fmtKey, fmtData] of Object.entries(formats)) {
          if (!fmtData || !fmtData.hash) continue;
          const fmtFileName = `${fmtData.hash}${fmtData.ext}`;
          const fmtFilePath = path.join(uploadsDir, fmtFileName);

          if (fs.existsSync(fmtFilePath)) {
            const fmtUpload = await cloudinary.uploader.upload(fmtFilePath, {
              folder: 'spoleczna/galerie',
              public_id: fmtData.hash,
              overwrite: true,
              resource_type: 'image'
            });
            fmtData.url = fmtUpload.secure_url;
            fmtData.provider_metadata = {
              public_id: fmtUpload.public_id,
              resource_type: fmtUpload.resource_type
            };
            console.log(`    - Format [${fmtKey}]: ${fmtUpload.secure_url}`);
          }
        }
      }

      // 3. Aktualizacja rekordu w bazie Neon Postgres
      const providerMetadata = {
        public_id: mainUpload.public_id,
        resource_type: mainUpload.resource_type
      };

      await sql`
        UPDATE files
        SET 
          url = ${mainUpload.secure_url},
          provider = 'cloudinary',
          provider_metadata = ${JSON.stringify(providerMetadata)},
          formats = ${formats ? JSON.stringify(formats) : null}
        WHERE id = ${file.id}
      `;

      migratedCount++;
      console.log(`  🎉 Zaktualizowano w bazie Neon: #${file.id}`);
    } catch (err) {
      console.error(`  ❌ Błąd uploadu pliku #${file.id}:`, err.message);
    }
  }

  console.log(`\n============================================================`);
  console.log(`🎉 Migracja zakończona! Pomyślnie zmigrowano ${migratedCount} z ${files.length} plików.`);
  console.log(`============================================================`);
}

migrate()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('Błąd krytyczny migracji:', e);
    process.exit(1);
  });
