# 🎓 Pierwsza Społeczna Szkoła Podstawowa w Chełmie (Sapere Aude)
## Oficjalna nowoczesna strona internetowa placówki

---

## 🌟 Najważniejsze wdrożone wytyczne i funkcjonalności:

1. **Oficjalne linki do mediów społecznościowych:**
   - **Facebook:** [ZespolSzkolSpolecznychwChelmie](https://www.facebook.com/ZespolSzkolSpolecznychwChelmie/?locale=pl_PL)
   - **Instagram:** [@spolecznachelm](https://www.instagram.com/spolecznachelm/)
   - **YouTube:** [Oficjalny kanał YouTube](https://www.youtube.com/channel/UCd0Qn0v7VJMFGs7UoiKlrNg)

2. **Terminy i nabór na rok szkolny 2026/2027:**
   - Zaktualizowano wszystkie formularze, nagłówki oraz karty naboru na **Rekrutacja 2026/2027**.

3. **Jasnożółte, przyjazne tło strony:**
   - Zastąpiono czystą biel ciepłą, elegancką paletą jasnożółtą (`#FFFDE8`, `#FFF8D6`, `#FFFEEA`), harmonizującą z głębokim kobaltowym granatem (`#1E2B82`) i słonecznym złotem (`#F8C830`).

4. **Pełna responsywność (Mobile, Tablet, Desktop):**
   - Elastyczny system siatek (`.recruitment-grid`, `.split-grid-2`, `.docs-grid`, `.news-grid`, `.offer-grid`).
   - Przewijalne na smartfonach tabele (`.table-responsive`) – rozkład lekcji i dzwonków.
   - Płynnie zwijane i rozwijane menu mobilne (hamburger) dostosowane do ekranów od 320 px do monitorów 4K.

5. **Konwersacje z Brytyjczykiem:**
   - Zgodnie z wytycznymi zastąpiono sekcję robotyki autorskim blokiem **„Konwersacje z Brytyjczykiem”** – żywy kontakt z rodowitym native speakerem z Wielkiej Brytanii, przełamywanie bariery językowej i naturalny akcent.

6. **Dyrekcja Szkoły:**
   - Zaktualizowano dane dyrektora placówki na: **Barbara Mazurek**.

7. **Oficjalne Godło / Logo Szkoły:**
   - Wdrożono okrągłe złote godło „Sapere Aude 1992” z przezroczystym tłem: plik [assets/icons/logo.png](file:///Users/mateuszmazurek/Desktop/Społeczna/assets/icons/logo.png).

8. **Dziennik elektroniczny VULCAN (UONET+ Chełm):**
   - Bezpośredni link: **`https://uonetplus.vulcan.net.pl/chelm`**

9. **Jednolita, oficjalna nazwa placówki:**
   - Usunięto nazwę „Zespół Szkół Społecznych w Chełmie”.
   - Wszędzie obowiązuje nazwa: **Pierwsza Społeczna Szkoła Podstawowa w Chełmie**.

10. **Wielopodstronowa struktura (12 dedykowanych podstron HTML):**
   - [index.html](file:///Users/mateuszmazurek/Desktop/Społeczna/index.html) – Strona Główna
   - [o-szkole.html](file:///Users/mateuszmazurek/Desktop/Społeczna/o-szkole.html) – O Szkole (historia od 1992 r., Dyrektor Barbara Mazurek, Chełmskie Towarzystwo Edukacyjne – Stowarzyszenie w Chełmie)
   - [kadra.html](file:///Users/mateuszmazurek/Desktop/Społeczna/kadra.html) – Kadra pedagogiczna (dyrekcja, nauczyciele przedmiotowi, edukacja wczesnoszkolna, specjaliści, administracja z wyszukiwarką i filtrami)
   - [aktualnosci.html](file:///Users/mateuszmazurek/Desktop/Społeczna/aktualnosci.html) – Aktualności i wydarzenia
   - [oferta.html](file:///Users/mateuszmazurek/Desktop/Społeczna/oferta.html) – Oferta edukacyjna (Edukacja wczesnoszkolna, Konwersacje z Brytyjczykiem, języki obce)
   - [dla-rodzicow.html](file:///Users/mateuszmazurek/Desktop/Społeczna/dla-rodzicow.html) – Strefa Rodzica (VULCAN UONET+, rozkład lekcji i dzwonków, kalendarz)
   - [regulaminy.html](file:///Users/mateuszmazurek/Desktop/Społeczna/regulaminy.html) – Statut i Regulaminy (pobieranie PDF)
   - [sukcesy.html](file:///Users/mateuszmazurek/Desktop/Społeczna/sukcesy.html) – Osiągnięcia i wyniki
   - [rekrutacja.html](file:///Users/mateuszmazurek/Desktop/Społeczna/rekrutacja.html) – Rekrutacja 2026/2027 (Karta Zgłoszenia PDF)
   - [galeria.html](file:///Users/mateuszmazurek/Desktop/Społeczna/galeria.html) – Galeria zdjęć
   - [kontakt.html](file:///Users/mateuszmazurek/Desktop/Społeczna/kontakt.html) – Kontakt i dojazd (ul. Hrubieszowska 102/2, tel. 82 565 45 54)
   - [deklaracja-dostepnosci.html](file:///Users/mateuszmazurek/Desktop/Społeczna/deklaracja-dostepnosci.html) – Ustawowa Deklaracja Dostępności Cyfrowej (WCAG 2.1 AA)

11. **Dostępność cyfrowa na poziomie WCAG 2.1 AA (Ustawowe wymogi dla szkół):**
   - **Panel Dostępności (Accessibility Menu):**
     - Pływający przycisk w lewym dolnym rogu ekranu otwierający okno modalne z ułatwieniami.
     - 3 tryby wysokiego kontrastu: **Czarne tło / żółty tekst**, **Czarne tło / biały tekst**, **Żółte tło / czarny tekst** oraz tryb standardowy.
     - Skalowanie rozmiaru tekstu do 200% (przyciski `A-`, `100%`, `120%`, `150%`, `200%`, `A+`) bez psucia layoutu dzięki architekturze `rem`.
     - Zwiększone odstępy między wierszami (interlinia 1.95), literami (tracking 0.12em) i słowami dla osób z dysleksją (kryterium WCAG 1.4.12).
     - Wymuszenie podkreślenia wszystkich odnośników na stronie.
     - Przycisk zatrzymania wszelkich animacji i sliderów (dla osób z padaczką fotogenną i zaburzeniami błędnika).
     - Przycisk przywrócenia ustawień domyślnych.
     - Trwałość preferencji w `localStorage` (zapamiętywanie ustawień między podstronami).
   - **Nawigacja klawiaturą i czytniki ekranu:**
     - Mechanizm **„Skip link”** (`<a href="#main-content" class="skip-link">Przejdź do treści głównej</a>`) na samym początku `<body>`, widoczny po wciśnięciu klawisza `Tab`.
     - Bardzo wyraźny, dwukolorowy wskaźnik skupienia (`:focus-visible`) na każdym elemencie klikalnym (kobaltowy granat + złoty obrys).
     - W pełni semantyczna struktura HTML5 (`role="banner"`, `<main id="main-content" tabindex="-1">`, `role="contentinfo"`).
     - Focus trap i obsługa klawisza `Escape` w menu dostępności.
   - **Zabezpieczenie atrybutów alt (CMS / Upload):**
     - Wbudowany w plik `js/script.js` automatyczny audyt w czasie rzeczywistym i `MutationObserver` wymuszający obecność atrybutu `alt` we wszystkich obrazach.
     - Skrypt walidacyjny [scripts/verify_wcag.py](file:///Users/mateuszmazurek/Desktop/Społeczna/scripts/verify_wcag.py).
   - **Ustawowa Deklaracja Dostępności:**
     - Dedykowana podstrona [deklaracja-dostepnosci.html](file:///Users/mateuszmazurek/Desktop/Społeczna/deklaracja-dostepnosci.html) zgodna z Ustawą z dnia 4 kwietnia 2019 r. o dostępności cyfrowej stron internetowych i aplikacji mobilnych podmiotów publicznych (Dz.U. 2019 poz. 848).
     - Stały link w stopce każdej podstrony serwisu.

12. **Uporządkowana struktura katalogów:**
   - **`css/`** – arkusze stylów ([css/style.css](file:///Users/mateuszmazurek/Desktop/Społeczna/css/style.css))
   - **`js/`** – skrypty i konfiguracja ([js/config.js](file:///Users/mateuszmazurek/Desktop/Społeczna/js/config.js), [js/script.js](file:///Users/mateuszmazurek/Desktop/Społeczna/js/script.js))
   - **`assets/`** – ikony i grafiki ([assets/icons/](file:///Users/mateuszmazurek/Desktop/Społeczna/assets/icons), [assets/images/](file:///Users/mateuszmazurek/Desktop/Społeczna/assets/images))
   - **`scripts/`** – skrypty audytujące i pomocnicze ([scripts/verify_wcag.py](file:///Users/mateuszmazurek/Desktop/Społeczna/scripts/verify_wcag.py))

---

## ♿ Audyt Dostępności WCAG 2.1 AA
Aby sprawdzić zgodność wszystkich podstron serwisu ze standardem WCAG 2.1 AA, uruchom w terminalu:
```bash
python3 scripts/verify_wcag.py
```

---

## 🚀 Jak uruchomić stronę?
Wystarczy otworzyć plik [index.html](file:///Users/mateuszmazurek/Desktop/Społeczna/index.html) w dowolnej przeglądarce (Safari, Chrome, Firefox, Edge) lub na telefonie. Strona nie wymaga zewnętrznych bibliotek serwerowych ani kompilacji – działa bezpośrednio w przeglądarce i jest gotowa do publikacji na serwerze WWW.
