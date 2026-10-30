/**
 * ====================================================================
 * KONFIGURACJA STRONY: PIERWSZA SPOŁECZNA SZKOŁA PODSTAWOWA W CHEŁMIE
 * Źródło danych: https://www.sapereaude.edu.pl/index.php
 * ====================================================================
 */

const SCHOOL_CONFIG = {
  school: {
    name: "Pierwsza Społeczna Szkoła Podstawowa w Chełmie",
    shortName: "PSSP Chełm • Sapere Aude",
    mottoLatin: "SAPERE AUDE",
    mottoPolish: "Odważ się być mądrym",
    foundedYear: 1992,
    
    // Dyrektor Szkoły (zaktualizowane)
    director: "Barbara Mazurek",
    directorTitle: "Dyrektor Szkoły: Barbara Mazurek",
    
    // Organ prowadzący
    governingBody: "Chełmskie Towarzystwo Edukacyjne – Stowarzyszenie w Chełmie",
    affiliation: "Stowarzyszenie w Chełmie",
    
    // Adresy
    address: {
      street: "ul. Hrubieszowska 102/2",
      secondaryStreet: "ul. 1 Pułku Szwoleżerów 17B",
      postalCode: "22-100",
      city: "Chełm",
      full: "ul. Hrubieszowska 102/2, 22-100 Chełm"
    },
    
    // Dane kontaktowe
    phone: "82 565 45 54",
    phoneDisplay: "tel. 82 565 45 54",
    email: "spoleczna_chelm@wp.pl",
    emailAlt: "sekretariat@sapereaude.edu.pl",
    website: "https://www.sapereaude.edu.pl",
    openingHours: "Poniedziałek – Piątek: 7:30 – 16:00",
    
    // Oficjalne nowe logo szkoły
    logoUrl: "assets/icons/logo.png"
  },

  // Zaktualizowane oficjalne media społecznościowe
  socials: {
    facebook: "https://www.facebook.com/ZespolSzkolSpolecznychwChelmie/?locale=pl_PL",
    instagram: "https://www.instagram.com/spolecznachelm/",
    youtube: "https://www.youtube.com/channel/UCd0Qn0v7VJMFGs7UoiKlrNg"
  },

  // E-dziennik: VULCAN UONET+ Chełm
  eDziennik: {
    name: "Dziennik VULCAN (UONET+)",
    url: "https://uonetplus.vulcan.net.pl/chelm",
    logoUrl: "assets/icons/vulcan-uonet.svg"
  },

  // Rekrutacja
  recruitment: {
    season: "2026/2027",
    badgeText: "Rekrutacja 2026/2027 Trwa"
  },

  // Kolorystyka: Jasnożółte tło + Głęboki kobaltowy granat + Słoneczny żółty akcent
  theme: {
    bgPage: "#FFFDE8",         // Jasnożółte tło strony
    bgWarm: "#FFF8D6",         // Cieplejsze jasnożółte tło sekcji
    heroBg: "#2596be",         // Kolor tła banera hero (#2596be)
    primary: "#1E2B82",        // Głęboki kobaltowy granat
    primaryDark: "#131D5B",
    primaryLight: "#2B3CB0",
    accent: "#F8C830",         // Ciepły słoneczny żółty
    accentDark: "#D8A514"
  },

  // Słowa na okrągłej naklejce banera
  heroBadgeWords: {
    line1: "wiedza",
    line2: "pasja",
    line3: "sapere aude"
  },

  // Dokumenty i regulaminy na rok 2026/2027
  documents: [
    {
      title: "Statut Pierwszej Społecznej Szkoły Podstawowej",
      filename: "Statut_PSSP_Chelm.pdf",
      desc: "Główny dokument określający cele, ustrój szkoły, prawa i obowiązki uczniów."
    },
    {
      title: "Wewnątrzszkolny System Oceniania (WSO)",
      filename: "WSO_PSSP_Chelm.pdf",
      desc: "Zasady sprawdzania wiedzy, oceniania bieżącego i klasyfikowania uczniów."
    },
    {
      title: "Standardy Ochrony Małoletnich",
      filename: "Standardy_Ochrony_Maloletnich_PSSP.pdf",
      desc: "Procedury ochrony dzieci przed krzywdzeniem i zasady bezpiecznych relacji."
    },
    {
      title: "Zasady korzystania z telefonów komórkowych i urządzeń mobilnych",
      filename: "Regulamin_Urzadzen_Mobilnych.pdf",
      desc: "Wewnętrzne wytyczne dotyczące bezpiecznego korzystania ze sprzętu elektronicznego."
    },
    {
      title: "Regulamin Świetlicy i Stołówki Szkolnej",
      filename: "Regulamin_Swietlicy.pdf",
      desc: "Organizacja pracy świetlicy (7:00 – 16:30) oraz zasady korzystania z obiadów."
    },
    {
      title: "Karta Zgłoszenia Kandydata do Szkoły / Zerówki 2026/2027",
      filename: "Karta_Zgloszenia_2026_2027.pdf",
      desc: "Oficjalny wniosek rekrutacyjny dla rodziców na nowy rok szkolny 2026/2027."
    }
  ]
};

if (typeof window !== "undefined") {
  window.SCHOOL_CONFIG = SCHOOL_CONFIG;
}
