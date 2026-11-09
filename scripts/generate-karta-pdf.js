import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';

async function generateKartaPDF() {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  // Czcionki z polskimi znakami
  const fontRegular = await doc.embedFont(fs.readFileSync('/System/Library/Fonts/Supplemental/Arial.ttf'));
  const fontBold = await doc.embedFont(fs.readFileSync('/System/Library/Fonts/Supplemental/Arial Bold.ttf'));
  const fontItalic = await doc.embedFont(fs.readFileSync('/System/Library/Fonts/Supplemental/Arial Italic.ttf'));

  // Format A4: 595.28 x 841.89 pt
  const page = doc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const marginLeft = 45;
  const marginRight = 45;
  const contentWidth = width - marginLeft - marginRight;

  // Kolory
  const cNavy = rgb(0.12, 0.28, 0.52);       // #1E4884
  const cDark = rgb(0.12, 0.16, 0.23);       // #1E293B
  const cMuted = rgb(0.39, 0.45, 0.55);      // #64748B
  const cBorder = rgb(0.82, 0.86, 0.90);     // #D1D5DB
  const cBgSoft = rgb(0.96, 0.97, 0.99);     // #F8FAFC
  const cLine = rgb(0.70, 0.74, 0.80);       // #B0B8C4

  let y = height - 42;

  // 1. Logo szkoły (jeśli istnieje)
  const logoPath = 'assets/icons/logo.png';
  if (fs.existsSync(logoPath)) {
    try {
      const logoBytes = fs.readFileSync(logoPath);
      const logoImg = await doc.embedPng(logoBytes);
      const logoDim = 50;
      page.drawImage(logoImg, {
        x: marginLeft,
        y: y - logoDim + 6,
        width: logoDim,
        height: logoDim
      });
    } catch (e) {}
  }

  // Nagłówek szkoły (obok logo)
  const headerTextX = marginLeft + 60;
  page.drawText('PIERWSZA SPOŁECZNA SZKOŁA PODSTAWOWA W CHEŁMIE', {
    x: headerTextX,
    y: y,
    size: 11,
    font: fontBold,
    color: cNavy
  });
  y -= 14;

  page.drawText('Organ prowadzący: Chełmskie Towarzystwo Edukacyjne – Stowarzyszenie w Chełmie', {
    x: headerTextX,
    y: y,
    size: 8.5,
    font: fontRegular,
    color: cDark
  });
  y -= 12;

  page.drawText('ul. Hrubieszowska 102/2, 22-100 Chełm   |   tel. 82 565 45 54   |   e-mail: spoleczna_chelm@wp.pl', {
    x: headerTextX,
    y: y,
    size: 8,
    font: fontRegular,
    color: cMuted
  });

  // Linia pozioma pod nagłówkiem
  y -= 14;
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: width - marginRight, y },
    thickness: 1.2,
    color: cBorder
  });

  // 2. Data i Adresat
  y -= 28;
  // Po lewej: Dane rodziców
  page.drawText('Pani / Pan: ........................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  // Po prawej: Miejscowość i data
  const dateStr = 'Chełm, dnia .............................. r.';
  const dateWidth = fontRegular.widthOfTextAtSize(dateStr, 10);
  page.drawText(dateStr, {
    x: width - marginRight - dateWidth,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  y -= 22;
  page.drawText('Adres zamieszkania: .........................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  // Po prawej: Dyrektor
  page.drawText('Dyrektor', {
    x: width - marginRight - 190,
    y,
    size: 10.5,
    font: fontBold,
    color: cNavy
  });

  y -= 20;
  page.drawText('Numer telefonu: ................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  page.drawText('Pierwszej Społecznej Szkoły Podstawowej', {
    x: width - marginRight - 190,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  y -= 20;
  page.drawText('Adres e-mail: .....................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  page.drawText('w Chełmie', {
    x: width - marginRight - 190,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  // 3. Tytuł formularza (elegancki boks)
  y -= 36;
  const boxHeight = 42;
  page.drawRectangle({
    x: marginLeft,
    y: y - boxHeight + 10,
    width: contentWidth,
    height: boxHeight,
    color: cBgSoft,
    borderColor: cBorder,
    borderWidth: 1.2
  });

  const title1 = 'KARTA ZGŁOSZENIA KANDYDATA / WNIOSEK O PRZYJĘCIE DO SZKOŁY';
  const t1Width = fontBold.widthOfTextAtSize(title1, 11.5);
  page.drawText(title1, {
    x: marginLeft + (contentWidth - t1Width) / 2,
    y: y + 1,
    size: 11.5,
    font: fontBold,
    color: cNavy
  });

  const title2 = 'do Pierwszej Społecznej Szkoły Podstawowej w Chełmie na rok szkolny 20.... / 20....';
  const t2Width = fontRegular.widthOfTextAtSize(title2, 9.5);
  page.drawText(title2, {
    x: marginLeft + (contentWidth - t2Width) / 2,
    y: y - 16,
    size: 9.5,
    font: fontRegular,
    color: cDark
  });

  // 4. Treść wniosku
  y -= 58;
  page.drawText('Zwracam się z uprzejmą prośbą o przyjęcie mojego dziecka:', {
    x: marginLeft,
    y,
    size: 10.5,
    font: fontRegular,
    color: cDark
  });

  y -= 26;
  page.drawText('Syna / Córki: ............................................................................................................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });
  y -= 11;
  page.drawText('(pełne imię i nazwisko kandydata)', {
    x: marginLeft + 180,
    y,
    size: 7.5,
    font: fontItalic,
    color: cMuted
  });

  y -= 22;
  page.drawText('Urodzonego(-ej) dnia: .............................................................   w: ..........................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  y -= 24;
  page.drawText('Numer PESEL: .............................................................................................................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cDark
  });

  y -= 24;
  page.drawText('do klasy: .......................   Pierwszej Społecznej Szkoły Podstawowej w Chełmie.', {
    x: marginLeft,
    y,
    size: 10.5,
    font: fontRegular,
    color: cDark
  });

  // Podpisy pod wnioskiem
  y -= 38;
  page.drawText('..........................................................................................................................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cLine
  });
  y -= 11;
  const signLabel = '(czytelne podpisy rodziców / prawnych opiekunów dziecka)';
  const sWidth = fontItalic.widthOfTextAtSize(signLabel, 8.5);
  page.drawText(signLabel, {
    x: marginLeft + (contentWidth - sWidth) / 2,
    y,
    size: 8.5,
    font: fontItalic,
    color: cMuted
  });

  // 5. Linia rozdzielająca przed RODO
  y -= 20;
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: width - marginRight, y },
    thickness: 1,
    color: cBorder
  });

  // 6. Klauzula informacyjna RODO
  y -= 20;
  page.drawText('KLAUZULA INFORMACYJNA O PRZETWARZANIU DANYCH OSOBOWYCH W PROCESIE REKRUTACJI', {
    x: marginLeft,
    y,
    size: 8.5,
    font: fontBold,
    color: cNavy
  });

  y -= 14;
  const rodoPoints = [
    '1. Administrator danych: Administratorem danych osobowych przetwarzanych w ramach procesu rekrutacji jest Chełmskie Towarzystwo Edukacyjne – Stowarzyszenie w Chełmie (organ prowadzący Pierwszą Społeczną Szkołę Podstawową w Chełmie), ul. Hrubieszowska 102/2, 22-100 Chełm.',
    '2. Cel i podstawa prawna: Dane w zakresie zawartym w niniejszym formularzu będą przetwarzane w celu przeprowadzenia procesu rekrutacji do szkoły. Podstawą prawną jest art. 6 ust. 1 lit. c) RODO w związku z art. 149 ust. 4 ustawy z dnia 14 grudnia 2016 r. Przepisy wprowadzające ustawę – Prawo oświatowe (Dz.U. z 2017 r. poz. 60 ze zm.).',
    '3. Odbiorcy danych: W ramach procesu rekrutacji dane nie będą udostępniane podmiotom trzecim, z wyjątkiem organów uprawnionych na mocy przepisów prawa (np. sąd, policja). Dane nie będą przekazywane do państwa trzeciego ani organizacji międzynarodowych.',
    '4. Okres przechowywania: Dane zgromadzone w procesie naboru będą przechowywane przez szkołę nie dłużej niż do końca okresu, w którym uczeń uczęszcza do placówki (zgodnie z art. 160 ust. 1 ustawy Prawo oświatowe).',
    '5. Prawa opiekunów i kandydata: Prawnym opiekunom przysługuje prawo dostępu do danych osobowych dziecka, ich sprostowania, usunięcia (co jest równoznaczne z rezygnacją z udziału w rekrutacji) oraz żądania ograniczenia przetwarzania (art. 18 RODO). Prawo do sprzeciwu i przenoszenia danych nie przysługuje ze względu na podstawę prawną przetwarzania (art. 6 ust. 1 lit. c RODO).',
    '6. Brak profilowania: Dane nie podlegają zautomatyzowanemu podejmowaniu decyzji ani profilowaniu w rozumieniu art. 22 RODO.',
    '7. Prawo do skargi: W przypadku uznania, że przetwarzanie narusza przepisy prawa, przysługuje prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).',
    '8. Dobrowolność podania danych: Podanie danych nie jest obowiązkowe, lecz jest warunkiem koniecznym do udziału w procesie rekrutacji do szkoły.'
  ];

  function wrapText(text, maxWidth, fontSize, font) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  for (const point of rodoPoints) {
    const lines = wrapText(point, contentWidth, 7.3, fontRegular);
    for (const line of lines) {
      page.drawText(line, {
        x: marginLeft,
        y,
        size: 7.3,
        font: fontRegular,
        color: cDark
      });
      y -= 9.8;
    }
    y -= 2;
  }

  // Podpis pod RODO
  y -= 14;
  page.drawText('Oświadczam, że zapoznałem(-am) się z powyższą klauzulą informacyjną dotyczącą przetwarzania danych osobowych:', {
    x: marginLeft,
    y,
    size: 8.2,
    font: fontItalic,
    color: cDark
  });

  y -= 28;
  page.drawText('..........................................................................................................................................................................', {
    x: marginLeft,
    y,
    size: 10,
    font: fontRegular,
    color: cLine
  });
  y -= 11;
  page.drawText('(czytelne podpisy rodziców / prawnych opiekunów dziecka)', {
    x: marginLeft + (contentWidth - sWidth) / 2,
    y,
    size: 8.5,
    font: fontItalic,
    color: cMuted
  });

  const pdfBytes = await doc.save();
  const outPath = 'assets/docs/karta-zgloszenia-kandydata.pdf';
  fs.writeFileSync(outPath, pdfBytes);
  console.log('Wygenerowano pomyślnie:', outPath, 'Rozmiar:', pdfBytes.length, 'bajtów. Pozostałe Y na dole:', y);
}

generateKartaPDF().catch(err => {
  console.error('Błąd generowania PDF:', err);
  process.exit(1);
});
