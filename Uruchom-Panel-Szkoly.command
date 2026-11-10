#!/bin/bash
cd "$(dirname "$0")/backend" || exit 1
echo "=================================================="
echo "🚀 URUCHAMIANIE PANELU STRAPI (SZKOŁA SPOŁECZNA)"
echo "=================================================="
echo ""
echo "Łączenie z bazą Neon Postgres i Cloudinary..."
echo "Panel otworzy się w przeglądarce pod adresem: http://localhost:1337/admin"
echo ""

# Otwórz przeglądarkę po uruchomieniu serwera
(sleep 4 && open "http://localhost:1337/admin") &

npm run develop
