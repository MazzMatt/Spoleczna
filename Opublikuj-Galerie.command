#!/bin/bash
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$(dirname "$0")" || exit 1
echo "=================================================="
echo "🚀 PUBLIKACJA GALERII I AKTUALNOŚCI NA GITHUB PAGES"
echo "=================================================="
npm run publish
echo ""
echo "✅ Gotowe! Zmiany pojawią się na GitHub Pages w ciągu 1 minuty."
echo "Naciśnij dowolny klawisz, aby zamknąć to okno..."
read -n 1 -s
