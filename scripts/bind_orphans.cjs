const fs = require('fs');
const path = require('path');

function bindPolishOrphansHTML(text) {
  if (!text) return '';
  let s = String(text);

  // 1. Spójniki 1-literowe: a, i, o, u, w, z (oraz wielkie A, I, O, U, W, Z)
  s = s.replace(/(?<![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9&])([aAiIoOuUwWzZ])[ \t]+/g, '$1&nbsp;');

  // 2. Krótkie przyimki i spójniki 2- i 3-literowe
  const shortWords = '(?:do|na|po|od|za|ze|we|ku|bo|że|co|to|nie|bez|dla|nad|pod|lub|czy|jak|aż|oraz)';
  const regShort = new RegExp('(?<![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9&])(' + shortWords + ')[ \\t]+', 'gi');
  s = s.replace(regShort, '$1&nbsp;');

  // 3. Typowe skróty (ul., al., pl., np., m.in., tzn., tzw., godz., tel., nr, p., dr, mgr, prof.)
  const abbrev = '(?:ul\\.|al\\.|pl\\.|np\\.|m\\.in\\.|tzn\\.|tzw\\.|godz\\.|tel\\.|nr|p\\.|dr|mgr|prof\\.)';
  const regAbbrev = new RegExp('(?<![a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ0-9&])(' + abbrev + ')[ \\t]+', 'gi');
  s = s.replace(regAbbrev, '$1&nbsp;');

  // 4. Liczby przed datami i jednostkami
  s = s.replace(/(\b\d+)[ \t]+(roku|r\.|lat|klasy|klas|godz\.|stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\b/gi, '$1&nbsp;$2');

  // 5. Myślnik (pauza / półpauza) - spacja niełamliwa przed myślnikiem
  s = s.replace(/([^\s])[ \t]+([–—])[ \t]+/g, '$1&nbsp;$2 ');

  return s;
}

function processHTML(html) {
  let result = '';
  let i = 0;
  const len = html.length;

  while (i < len) {
    // 1. Komentarze HTML
    if (html.slice(i, i + 4) === '<!--') {
      const end = html.indexOf('-->', i + 4);
      if (end === -1) {
        result += html.slice(i);
        break;
      } else {
        result += html.slice(i, end + 3);
        i = end + 3;
        continue;
      }
    }

    // 2. Tagi HTML oraz bloki specjalne (script, style, svg, code, pre)
    if (html[i] === '<') {
      const match = html.slice(i).match(/^<\s*(script|style|svg|code|pre)\b[^>]*>/i);
      if (match) {
        const tag = match[1].toLowerCase();
        const closeTag = '</' + tag + '>';
        const closeIndex = html.toLowerCase().indexOf(closeTag, i + match[0].length);
        if (closeIndex === -1) {
          result += html.slice(i);
          break;
        } else {
          result += html.slice(i, closeIndex + closeTag.length);
          i = closeIndex + closeTag.length;
          continue;
        }
      }

      // Zwykły tag HTML - pomijamy z zachowaniem atrybutów w cudzysłowach
      let j = i + 1;
      let quote = null;
      while (j < len) {
        const c = html[j];
        if (quote) {
          if (c === quote) quote = null;
        } else {
          if (c === '"' || c === "'") {
            quote = c;
          } else if (c === '>') {
            j++;
            break;
          }
        }
        j++;
      }
      result += html.slice(i, j);
      i = j;
      continue;
    }

    // 3. Czysty tekst pomiędzy tagami
    let nextTag = html.indexOf('<', i);
    if (nextTag === -1) nextTag = len;
    let text = html.slice(i, nextTag);

    // Zastosowanie reguł typografii polskiej
    text = bindPolishOrphansHTML(text);

    result += text;
    i = nextTag;
  }

  return result;
}

const htmlFiles = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.html'));

let changedCount = 0;
htmlFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  const original = fs.readFileSync(filePath, 'utf8');
  const processed = processHTML(original);
  if (processed !== original) {
    fs.writeFileSync(filePath, processed, 'utf8');
    changedCount++;
    console.log(`Zaktualizowano plik: ${file}`);
  } else {
    console.log(`Bez zmian (brak sierotek): ${file}`);
  }
});

console.log(`\nZakończono! Zaktualizowano ${changedCount} z ${htmlFiles.length} plików HTML.`);
