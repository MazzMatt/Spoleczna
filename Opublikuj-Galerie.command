#!/bin/bash
cd "$(dirname "$0")" || exit 1
echo "=================================================="
echo "🚀 PUBLIKACJA GALERII NA GITHUB PAGES"
echo "=================================================="
npm run publish
echo ""
echo "✅ Gotowe! Nowe galerie pojawią się na GitHub Pages w ciągu 1-2 minut."
echo "Naciśnij dowolny klawisz, aby zamknąć to okno..."
read -n 1 -s
