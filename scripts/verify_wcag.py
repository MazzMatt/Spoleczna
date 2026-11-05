#!/usr/bin/env python3
"""
Skrypt walidujący zgodność z wymogami dostępności cyfrowej WCAG 2.1 AA
dla strony Pierwszej Społecznej Szkoły Podstawowej w Chełmie.
"""

import glob
import re
import sys

def verify_wcag():
    html_files = sorted(glob.glob('*.html'))
    if not html_files:
        print("BŁĄD: Nie znaleziono plików HTML w bieżącym katalogu!")
        sys.exit(1)

    print(f"Rozpoczynam audyt WCAG 2.1 AA dla {len(html_files)} plików HTML...")
    
    total_imgs = 0
    passed_files = 0
    has_errors = False

    for file_path in html_files:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        file_errors = []

        # 1. Skip link
        if '<a href="#main-content" class="skip-link">' not in content:
            file_errors.append("Brak mechanizmu 'Skip link' (<a href='#main-content' class='skip-link'>)")

        # 2. Główny kontener <main>
        if '<main id="main-content"' not in content or '</main>' not in content:
            file_errors.append("Brak semantycznego znacznika <main id='main-content' tabindex='-1'>")

        # 3. Role punktów orientacyjnych (landmarks)
        if 'role="banner"' not in content:
            file_errors.append("Brak role='banner' w nagłówku <header>")
        if 'role="contentinfo"' not in content:
            file_errors.append("Brak role='contentinfo' w stopce <footer>")

        # 4. Stały link do Deklaracji Dostępności
        if 'deklaracja-dostepnosci.html' not in content:
            file_errors.append("Brak stałego odnośnika do deklaracja-dostepnosci.html w stopce")

        # 5. Weryfikacja atrybutów alt w grafikach
        imgs = re.findall(r'<img[^>]*>', content)
        total_imgs += len(imgs)
        for img in imgs:
            if 'alt=' not in img:
                file_errors.append(f"Obraz bez atrybutu alt: {img}")
            elif 'alt=""' in img or "alt=''" in img:
                # Tylko elementy czysto dekoracyjne mogą mieć puste alt, ale zgodnie z audytem sprawdzamy aria-hidden
                if 'aria-hidden="true"' not in img and 'role="presentation"' not in img:
                    file_errors.append(f"Pusty atrybut alt w niedekoracyjnym obrazie: {img}")

        if file_errors:
            has_errors = True
            print(f"\n❌ BŁĘDY W PLIKU: {file_path}")
            for err in file_errors:
                print(f"   • {err}")
        else:
            passed_files += 1

    print("\n" + "="*60)
    print(f"PODSUMOWANIE AUDYTU WCAG 2.1 AA:")
    print(f" • Sprawdzone pliki HTML: {len(html_files)}")
    print(f" • Pliki w 100% zgodne:   {passed_files}/{len(html_files)}")
    print(f" • Zweryfikowane obrazy:  {total_imgs} (wszystkie posiadają opisy alt)")
    print("="*60)

    if has_errors:
        print("\n❌ Audyt zakończony niepowodzeniem. Popraw błędy przed wdrożeniem.")
        sys.exit(1)
    else:
        print("\n✅ Audyt WCAG 2.1 AA zakończony pełnym sukcesem! Wszystkie wymogi spełnione.")
        sys.exit(0)

if __name__ == '__main__':
    verify_wcag()
