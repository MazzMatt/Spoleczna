#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")/backend" || exit 1

echo "=================================================="
echo "🚀 URUCHAMIANIE PANELU STRAPI (SZKOŁA SPOŁECZNA)"
echo "=================================================="
echo ""
echo "Łączenie z bazą Neon Postgres i Cloudinary..."
echo "Panel otworzy się automatycznie pod adresem:"
echo "http://localhost:1337/admin"
echo ""
echo "(Nie zamykaj tego okna terminala podczas korzystania z panelu)"
echo "=================================================="
echo ""

# Poczekaj chwilę na start serwera i otwórz w przeglądarce
(sleep 5 && open "http://localhost:1337/admin") &

npm run develop
