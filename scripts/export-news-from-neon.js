import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env') });
dotenv.config({ path: path.join(rootDir, 'backend', '.env') });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Brak DATABASE_URL');
  process.exit(1);
}

const sql = neon(connectionString);

async function exportNews() {
  console.log('Pobieranie opublikowanych aktualności z bazy Neon...');
  
  const rows = await sql`
    SELECT 
      a.id,
      a.document_id,
      a.tytul,
      a.data,
      a.opis,
      a.created_at,
      a.updated_at,
      a.published_at,
      f.id as zdjecie_id,
      f.document_id as zdjecie_doc_id,
      f.name as zdjecie_name,
      f.alternative_text as zdjecie_alt,
      f.caption as zdjecie_caption,
      f.focal_point as zdjecie_focal,
      f.width as zdjecie_width,
      f.height as zdjecie_height,
      f.formats as zdjecie_formats,
      f.hash as zdjecie_hash,
      f.ext as zdjecie_ext,
      f.mime as zdjecie_mime,
      f.size as zdjecie_size,
      f.url as zdjecie_url,
      f.preview_url as zdjecie_preview_url,
      f.provider as zdjecie_provider,
      f.provider_metadata as zdjecie_provider_metadata,
      g.id as galeria_id,
      g.document_id as galeria_document_id,
      g.tytul as galeria_tytul
    FROM aktualnoscs a
    LEFT JOIN files_related_mph m ON m.related_id = a.id AND m.related_type = 'api::aktualnosc.aktualnosc' AND m.field = 'Zdjecie'
    LEFT JOIN files f ON f.id = m.file_id
    LEFT JOIN aktualnoscs_galeria_lnk ag ON ag.aktualnosc_id = a.id
    LEFT JOIN galerias g ON g.id = ag.galeria_id
    WHERE a.published_at IS NOT NULL
    ORDER BY a.data DESC NULLS LAST, a.created_at DESC;
  `;
  console.log(`Pobrano ${rows.length} artykułów.`);

  const items = rows.map(r => {
    // Format daty YYYY-MM-DD
    let formattedDate = '';
    if (r.data) {
      const d = new Date(r.data);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().split('T')[0];
      }
    }

    let zdjecieObj = null;
    if (r.zdjecie_url) {
      zdjecieObj = {
        id: r.zdjecie_id,
        documentId: r.zdjecie_doc_id,
        name: r.zdjecie_name,
        alternativeText: r.zdjecie_alt,
        caption: r.zdjecie_caption,
        focalPoint: r.zdjecie_focal,
        width: r.zdjecie_width,
        height: r.zdjecie_height,
        formats: r.zdjecie_formats,
        hash: r.zdjecie_hash,
        ext: r.zdjecie_ext,
        mime: r.zdjecie_mime,
        size: r.zdjecie_size ? Number(r.zdjecie_size) : null,
        url: r.zdjecie_url,
        previewUrl: r.zdjecie_preview_url,
        provider: r.zdjecie_provider || 'cloudinary',
        provider_metadata: r.zdjecie_provider_metadata
      };
    }

    let galeriaObj = null;
    if (r.galeria_document_id || r.galeria_tytul) {
      galeriaObj = {
        id: r.galeria_id,
        documentId: r.galeria_document_id,
        Tytul: r.galeria_tytul
      };
    }

    return {
      id: r.id,
      documentId: r.document_id,
      tytul: r.tytul,
      data: formattedDate,
      opis: r.opis,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
      updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : null,
      publishedAt: r.published_at ? new Date(r.published_at).toISOString() : null,
      Zdjecie: zdjecieObj,
      Galeria: galeriaObj
    };
  });

  const output = {
    data: items,
    meta: {
      pagination: {
        page: 1,
        pageSize: 100,
        pageCount: 1,
        total: items.length
      }
    }
  };

  const targetPath = path.join(rootDir, 'data', 'aktualnosci.json');
  fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Zapisano pomyślnie ${items.length} aktualności do ${targetPath}`);
}

exportNews().catch(err => {
  console.error('Błąd:', err);
  process.exit(1);
});
