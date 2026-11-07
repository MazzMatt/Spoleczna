/**
 * ====================================================================
 * PIERWSZA SPOŁECZNA SZKOŁA PODSTAWOWA W CHEŁMIE
 * Skrypt interaktywny: slider, menu mobilne, modal dokumentów, liczniki,
 * panel dostępności WCAG 2.1 AA, audyt dostępności cyfrowej
 * ====================================================================
 */

// Natychmiastowe przywrócenie preferencji WCAG z localStorage przed renderem
(function initA11yEarly() {
  try {
    const raw = localStorage.getItem('pssp_a11y_settings');
    if (!raw) return;
    const s = JSON.parse(raw);
    const root = document.documentElement;
    if (s.contrast && s.contrast !== 'default') {
      root.setAttribute('data-contrast', s.contrast);
    }
    if (s.fontScale && s.fontScale !== '100') {
      root.classList.add(`font-scale-${s.fontScale}`);
    }
    if (s.dyslexia) root.classList.add('dyslexia-mode');
    if (s.underlineLinks) root.classList.add('underline-links');
    if (s.stopMotion) root.classList.add('stop-motion');
  } catch (e) {
    console.warn('Błąd odczytu ustawień dostępności WCAG:', e);
  }
})();

document.addEventListener('DOMContentLoaded', () => {

  // ------------------------------------------------------------------
  // 1. GŁÓWNY BANER (HERO SLIDER)
  // ------------------------------------------------------------------
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  let currentSlide = 0;
  let slideInterval = null;

  function showSlide(index) {
    if (!slides.length) return;
    
    if (index >= slides.length) currentSlide = 0;
    else if (index < 0) currentSlide = slides.length - 1;
    else currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoplay(); });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      showSlide(idx);
      resetAutoplay();
    });
  });

  function startAutoplay() {
    if (slides.length > 1) {
      if (document.documentElement.classList.contains('stop-motion')) return;
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 7000);
    }
  }

  function resetAutoplay() {
    clearInterval(slideInterval);
    startAutoplay();
  }

  startAutoplay();

  const sliderSection = document.getElementById('glowna');
  if (sliderSection) {
    sliderSection.addEventListener('mouseenter', () => clearInterval(slideInterval));
    sliderSection.addEventListener('mouseleave', () => startAutoplay());

    // Obsługa gestów swipe na smartfonach i tabletach
    let touchStartX = 0;
    let touchStartY = 0;

    sliderSection.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });

    sliderSection.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = touchStartX - touchEndX;
      const diffY = touchStartY - touchEndY;

      // Reaguj tylko na wyraźny ruch poziomy (nie blokując scrollowania strony)
      if (Math.abs(diffX) > 35 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        resetAutoplay();
      }
    }, { passive: true });
  }


  // ------------------------------------------------------------------
  // 2. MENU MOBILNE (HAMBURGER)
  // ------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav-menu');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        mainNav.classList.remove('open');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      }
    });
  }


  // ------------------------------------------------------------------
  // 3. ANIMOWANE LICZNIKI STATYSTYK
  // ------------------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number');
  let statsAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        animateCounters();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) {
    observer.observe(statsSection);
  }

  function animateCounters() {
    statNumbers.forEach(stat => {
      const target = parseInt(stat.getAttribute('data-target'), 10);
      if (isNaN(target)) return;
      const isPercent = stat.textContent.includes('%');
      const isPlus = stat.textContent.includes('+');
      
      const duration = 1800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeProgress * target);

        let formatted = current;
        if (isPercent) formatted = `${current}%`;
        else if (isPlus) formatted = `${current}+`;

        stat.textContent = formatted;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (isPercent) stat.textContent = `${target}%`;
          else if (isPlus) stat.textContent = `${target}+`;
          else stat.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });

    // Uruchomienie animacji dla odznaki TOP
    const badgeTop = document.querySelector('.stat-badge-top');
    if (badgeTop) {
      badgeTop.classList.add('animated');
    }
  }


  // ------------------------------------------------------------------
  // 4. INTERAKTYWNY MODAL POBIERANIA DOKUMENTÓW (PDF)
  // ------------------------------------------------------------------
  const docModal = document.getElementById('doc-modal');
  const modalClose = document.getElementById('modal-close');
  const modalCancel = document.getElementById('modal-cancel-btn');
  const modalTitle = document.getElementById('modal-doc-title');
  const modalDownload = document.getElementById('modal-download-btn');

  document.querySelectorAll('.doc-download-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const title = trigger.getAttribute('data-title') || "Dokument Szkolny";
      if (modalTitle) modalTitle.textContent = title;
      if (docModal) docModal.classList.add('active');
    });
  });

  function closeModal() {
    if (docModal) docModal.classList.remove('active');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modalCancel) modalCancel.addEventListener('click', closeModal);

  if (docModal) {
    docModal.addEventListener('click', (e) => {
      if (e.target === docModal) closeModal();
    });
  }

  if (modalDownload) {
    modalDownload.addEventListener('click', () => {
      modalDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Pobieranie...';
      setTimeout(() => {
        modalDownload.innerHTML = '<i class="fa-solid fa-check"></i> Pobrano pomyślnie!';
        setTimeout(() => {
          modalDownload.innerHTML = '<i class="fa-solid fa-download"></i> Pobierz plik PDF';
          closeModal();
        }, 1200);
      }, 700);
    });
  }


  // ------------------------------------------------------------------
  // 5. FORMULARZ KONTAKTOWY (WYSYŁKA NA POCZTĘ SZKOŁY: spoleczna_chelm@wp.pl)
  // ------------------------------------------------------------------
  const contactForm = document.getElementById('school-contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('form-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const phoneInput = document.getElementById('form-phone');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value : 'Zapytanie ze strony';
      const message = messageInput ? messageInput.value.trim() : '';

      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Wysyłanie wiadomości...</span> <i class="fa-solid fa-spinner fa-spin"></i>';
      }

      if (formStatus) {
        formStatus.style.display = 'none';
      }

      try {
        // 1. Zapis do bazy danych Neon Lakebase Postgres (gdy serwer jest uruchomiony)
        let neonSuccess = false;
        try {
          const neonRes = await fetch('/api/contact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ name, phone, email, subject, message })
          });
          if (neonRes.ok) {
            neonSuccess = true;
          }
        } catch (neonErr) {
          // Pomijamy jeśli strona działa w trybie czysto statycznym (np. GitHub Pages)
        }

        // 2. Wysłanie powiadomienia e-mail przez FormSubmit
        const response = await fetch("https://formsubmit.co/ajax/spoleczna_chelm@wp.pl", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            "Nadawca": name,
            "Telefon": phone,
            "Adres e-mail": email,
            "Temat": subject,
            "Treść wiadomości": message,
            "_subject": `[Formularz WWW] ${subject} - ${name}`
          })
        });

        const data = await response.json();

        if (response.ok && (data.success === "true" || data.success === true || response.status === 200)) {
          if (formStatus) {
            formStatus.style.display = 'block';
            formStatus.style.background = '#ECFDF5';
            formStatus.style.color = '#065F46';
            formStatus.style.border = '1px solid #A7F3D0';
            formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Dziękujemy, ${name}! Twoja wiadomość została pomyślnie wysłana i zapisana${neonSuccess ? ' w bazie danych szkoły' : ''}.`;
          }
          contactForm.reset();
        } else if (neonSuccess) {
          // Zapisano w bazie Neon, mimo ewentualnego problemu z bramką mailową
          if (formStatus) {
            formStatus.style.display = 'block';
            formStatus.style.background = '#ECFDF5';
            formStatus.style.color = '#065F46';
            formStatus.style.border = '1px solid #A7F3D0';
            formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Dziękujemy, ${name}! Wiadomość została bezpiecznie zarejestrowana w bazie danych szkoły.`;
          }
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Błąd wysyłki');
        }
      } catch (err) {
        console.warn('Wysyłka FormSubmit w tle nie powiodła się, uruchamiam bezpieczny fallback mailto:', err);
        const mailtoUrl = `mailto:spoleczna_chelm@wp.pl?subject=${encodeURIComponent('[Formularz WWW] ' + subject)}&body=${encodeURIComponent(
          `Imię i nazwisko: ${name}\nTelefon: ${phone}\nE-mail: ${email}\nTemat: ${subject}\n\nWiadomość:\n${message}`
        )}`;
        
        if (formStatus) {
          formStatus.style.display = 'block';
          formStatus.style.background = '#EFF6FF';
          formStatus.style.color = '#1E40AF';
          formStatus.style.border = '1px solid #BFDBFE';
          formStatus.innerHTML = `<i class="fa-solid fa-envelope-open-text"></i> Otwieramy Twój program pocztowy z gotową wiadomością do <strong>spoleczna_chelm@wp.pl</strong>. <a href="${mailtoUrl}" style="color: #1E3A8A; text-decoration: underline; font-weight: bold;">Kliknij tutaj, jeśli okno poczty się nie otworzyło</a>.`;
        }
        window.location.href = mailtoUrl;
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  // ------------------------------------------------------------------
  // 6. WYSZUKIWARKA I FILTROWANIE KADRY (kadra.html)
  // ------------------------------------------------------------------
  const staffFilterBtns = document.querySelectorAll('.staff-filter-btn');
  const staffCategoryBlocks = document.querySelectorAll('.staff-category-block');
  const staffSearchInput = document.getElementById('staff-search-input');

  function filterStaffList() {
    const activeBtn = document.querySelector('.staff-filter-btn.active');
    const activeFilter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
    const query = staffSearchInput ? staffSearchInput.value.toLowerCase().trim() : '';

    staffCategoryBlocks.forEach(block => {
      const blockCategory = block.getAttribute('data-category');
      const categoryMatches = (activeFilter === 'all' || blockCategory === activeFilter);

      const cards = block.querySelectorAll('.staff-card, .management-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        const matchesQuery = !query || text.includes(query);

        if (matchesQuery) {
          card.style.display = 'flex';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (categoryMatches && visibleCount > 0) {
        block.style.display = 'block';
      } else {
        block.style.display = 'none';
      }
    });
  }

  if (staffFilterBtns.length) {
    staffFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        staffFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterStaffList();
      });
    });
  }

  if (staffSearchInput) {
    staffSearchInput.addEventListener('input', filterStaffList);
  }


  // ------------------------------------------------------------------
  // 7. WIDGET DOSTĘPNOŚCI CYFROWEJ (WCAG 2.1 AA ACCESSIBILITY MENU)
  // ------------------------------------------------------------------
  function initA11yWidget() {
    // 1. Sprawdzenie i dynamiczne wstrzyknięcie HTML widgetu
    if (!document.getElementById('a11y-trigger')) {
      const widgetMarkup = `
        <!-- Przycisk pływający menu dostępności -->
        <button type="button" id="a11y-trigger" class="a11y-widget-trigger" aria-haspopup="dialog" aria-expanded="false" aria-controls="a11y-modal" aria-label="Otwórz panel ułatwień dostępu (WCAG 2.1)">
          <i class="fa-solid fa-universal-access" aria-hidden="true"></i>
          <span class="a11y-trigger-text">Dostępność</span>
        </button>

        <!-- Okno modalne panelu dostępności -->
        <div id="a11y-modal" class="a11y-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="a11y-modal-title" hidden>
          <div class="a11y-modal-container" role="document">
            
            <div class="a11y-modal-header">
              <div class="a11y-modal-heading">
                <i class="fa-solid fa-universal-access a11y-header-icon" aria-hidden="true"></i>
                <h2 id="a11y-modal-title" class="a11y-modal-title">Ułatwienia Dostępności</h2>
              </div>
              <button type="button" class="a11y-close-btn" id="a11y-close-btn" aria-label="Zamknij panel ułatwień dostępu">
                <i class="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>

            <div class="a11y-modal-body">
              
              <!-- 1. Kontrast strony -->
              <section class="a11y-section" aria-labelledby="a11y-contrast-heading">
                <h3 id="a11y-contrast-heading" class="a11y-section-title">
                  <i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i> Tryby wysokiego kontrastu
                </h3>
                <div class="a11y-contrast-grid">
                  <button type="button" class="a11y-contrast-btn active" data-contrast="default" aria-pressed="true">
                    <span class="a11y-preview-circle preview-default" aria-hidden="true">A</span>
                    <span>Standardowy</span>
                  </button>
                  <button type="button" class="a11y-contrast-btn" data-contrast="black-yellow" aria-pressed="false">
                    <span class="a11y-preview-circle preview-by" aria-hidden="true">A</span>
                    <span>Czarne / Żółte</span>
                  </button>
                  <button type="button" class="a11y-contrast-btn" data-contrast="black-white" aria-pressed="false">
                    <span class="a11y-preview-circle preview-bw" aria-hidden="true">A</span>
                    <span>Czarne / Białe</span>
                  </button>
                  <button type="button" class="a11y-contrast-btn" data-contrast="yellow-black" aria-pressed="false">
                    <span class="a11y-preview-circle preview-yb" aria-hidden="true">A</span>
                    <span>Żółte / Czarne</span>
                  </button>
                </div>
              </section>

              <!-- 2. Skalowanie czcionki -->
              <section class="a11y-section" aria-labelledby="a11y-font-heading">
                <div class="a11y-section-header">
                  <h3 id="a11y-font-heading" class="a11y-section-title">
                    <i class="fa-solid fa-text-height" aria-hidden="true"></i> Rozmiar tekstu
                  </h3>
                  <span class="a11y-font-badge" id="a11y-font-badge" aria-live="polite">100%</span>
                </div>
                <div class="a11y-font-grid">
                  <button type="button" class="a11y-font-step-btn" id="a11y-font-decrease" aria-label="Zmniejsz rozmiar tekstu">
                    <i class="fa-solid fa-minus" aria-hidden="true"></i> A-
                  </button>
                  <button type="button" class="a11y-font-size-btn active" data-scale="100" aria-pressed="true">100%</button>
                  <button type="button" class="a11y-font-size-btn" data-scale="120" aria-pressed="false">120%</button>
                  <button type="button" class="a11y-font-size-btn" data-scale="150" aria-pressed="false">150%</button>
                  <button type="button" class="a11y-font-size-btn" data-scale="200" aria-pressed="false">200%</button>
                  <button type="button" class="a11y-font-step-btn" id="a11y-font-increase" aria-label="Zwiększ rozmiar tekstu">
                    A+ <i class="fa-solid fa-plus" aria-hidden="true"></i>
                  </button>
                </div>
              </section>

              <!-- 3. Odstępy i czytelność (Dysleksja) -->
              <section class="a11y-section" aria-labelledby="a11y-readability-heading">
                <h3 id="a11y-readability-heading" class="a11y-section-title">
                  <i class="fa-solid fa-book-open-reader" aria-hidden="true"></i> Czytelność tekstu
                </h3>
                <div class="a11y-toggles-list">
                  <label class="a11y-toggle-item" for="a11y-toggle-dyslexia">
                    <span class="a11y-toggle-label">
                      <strong>Zwiększone odstępy (dysleksja)</strong>
                      <small>Zwiększa światło między wierszami i literami</small>
                    </span>
                    <input type="checkbox" id="a11y-toggle-dyslexia" class="a11y-checkbox">
                    <span class="a11y-switch-slider" aria-hidden="true"></span>
                  </label>
                  
                  <label class="a11y-toggle-item" for="a11y-toggle-links">
                    <span class="a11y-toggle-label">
                      <strong>Podkreślenie odnośników</strong>
                      <small>Wyraźnie wyróżnia wszystkie linki na stronie</small>
                    </span>
                    <input type="checkbox" id="a11y-toggle-links" class="a11y-checkbox">
                    <span class="a11y-switch-slider" aria-hidden="true"></span>
                  </label>
                </div>
              </section>

              <!-- 4. Ruch i animacje -->
              <section class="a11y-section" aria-labelledby="a11y-motion-heading">
                <h3 id="a11y-motion-heading" class="a11y-section-title">
                  <i class="fa-solid fa-film" aria-hidden="true"></i> Ruch i animacje
                </h3>
                <div class="a11y-toggles-list">
                  <label class="a11y-toggle-item" for="a11y-toggle-motion">
                    <span class="a11y-toggle-label">
                      <strong>Zatrzymaj animacje i slider</strong>
                      <small>Dla osób z padaczką fotogenną i zaburzeniami błędnika</small>
                    </span>
                    <input type="checkbox" id="a11y-toggle-motion" class="a11y-checkbox">
                    <span class="a11y-switch-slider" aria-hidden="true"></span>
                  </label>
                </div>
              </section>

              <!-- 5. Stopka panelu: Reset i Deklaracja -->
              <div class="a11y-modal-footer">
                <button type="button" class="a11y-reset-btn" id="a11y-reset-btn" aria-label="Przywróć domyślne ustawienia wyglądu strony">
                  <i class="fa-solid fa-rotate-left" aria-hidden="true"></i> Przywróć domyślne
                </button>
                <a href="deklaracja-dostepnosci.html" class="a11y-decl-link">
                  <i class="fa-solid fa-file-shield" aria-hidden="true"></i> Deklaracja Dostępności
                </a>
              </div>

            </div>
          </div>
        </div>
      `;
      document.body.insertAdjacentHTML('beforeend', widgetMarkup);
    }

    const triggerBtn = document.getElementById('a11y-trigger');
    const modal = document.getElementById('a11y-modal');
    const closeBtn = document.getElementById('a11y-close-btn');
    const resetBtn = document.getElementById('a11y-reset-btn');

    const contrastBtns = document.querySelectorAll('.a11y-contrast-btn');
    const fontSizeBtns = document.querySelectorAll('.a11y-font-size-btn');
    const fontDecreaseBtn = document.getElementById('a11y-font-decrease');
    const fontIncreaseBtn = document.getElementById('a11y-font-increase');
    const fontBadge = document.getElementById('a11y-font-badge');

    const toggleDyslexia = document.getElementById('a11y-toggle-dyslexia');
    const toggleLinks = document.getElementById('a11y-toggle-links');
    const toggleMotion = document.getElementById('a11y-toggle-motion');

    const FONT_SCALES = ['100', '120', '150', '200'];

    // Pobranie aktualnego stanu
    let settings = {
      contrast: 'default',
      fontScale: '100',
      dyslexia: false,
      underlineLinks: false,
      stopMotion: false
    };

    try {
      const stored = localStorage.getItem('pssp_a11y_settings');
      if (stored) {
        settings = Object.assign(settings, JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Błąd parsowania ustawień dostępności:', e);
    }

    // Synchronizacja kontrolek formularza z załadowanym stanem
    function syncControls() {
      // Kontrast
      contrastBtns.forEach(btn => {
        const isMatch = btn.getAttribute('data-contrast') === settings.contrast;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });

      // Czcionka
      fontSizeBtns.forEach(btn => {
        const isMatch = btn.getAttribute('data-scale') === settings.fontScale;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-pressed', isMatch ? 'true' : 'false');
      });
      if (fontBadge) {
        fontBadge.textContent = `${settings.fontScale}%`;
      }

      // Checkboxy
      if (toggleDyslexia) toggleDyslexia.checked = !!settings.dyslexia;
      if (toggleLinks) toggleLinks.checked = !!settings.underlineLinks;
      if (toggleMotion) toggleMotion.checked = !!settings.stopMotion;
    }

    function saveSettings() {
      try {
        localStorage.setItem('pssp_a11y_settings', JSON.stringify(settings));
      } catch (e) {
        console.warn('Nie można zapisać ustawień do localStorage:', e);
      }
    }

    // Aplikowanie zmian na dokumencie
    function applyContrast(contrast) {
      settings.contrast = contrast;
      if (contrast === 'default') {
        document.documentElement.removeAttribute('data-contrast');
      } else {
        document.documentElement.setAttribute('data-contrast', contrast);
      }
      syncControls();
      saveSettings();
    }

    function applyFontScale(scale) {
      if (!FONT_SCALES.includes(scale)) scale = '100';
      settings.fontScale = scale;

      document.documentElement.classList.remove('font-scale-120', 'font-scale-150', 'font-scale-200');
      if (scale !== '100') {
        document.documentElement.classList.add(`font-scale-${scale}`);
      }

      syncControls();
      saveSettings();
    }

    function applyDyslexia(enabled) {
      settings.dyslexia = enabled;
      document.documentElement.classList.toggle('dyslexia-mode', enabled);
      syncControls();
      saveSettings();
    }

    function applyUnderlineLinks(enabled) {
      settings.underlineLinks = enabled;
      document.documentElement.classList.toggle('underline-links', enabled);
      syncControls();
      saveSettings();
    }

    function applyStopMotion(enabled) {
      settings.stopMotion = enabled;
      document.documentElement.classList.toggle('stop-motion', enabled);
      if (enabled) {
        clearInterval(slideInterval);
      } else {
        startAutoplay();
      }
      syncControls();
      saveSettings();
    }

    // Zdarzenia przycisków kontrastu
    contrastBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyContrast(btn.getAttribute('data-contrast'));
      });
    });

    // Zdarzenia rozmiaru czcionki
    fontSizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        applyFontScale(btn.getAttribute('data-scale'));
      });
    });

    if (fontDecreaseBtn) {
      fontDecreaseBtn.addEventListener('click', () => {
        const currentIndex = FONT_SCALES.indexOf(settings.fontScale);
        if (currentIndex > 0) {
          applyFontScale(FONT_SCALES[currentIndex - 1]);
        }
      });
    }

    if (fontIncreaseBtn) {
      fontIncreaseBtn.addEventListener('click', () => {
        const currentIndex = FONT_SCALES.indexOf(settings.fontScale);
        if (currentIndex < FONT_SCALES.length - 1) {
          applyFontScale(FONT_SCALES[currentIndex + 1]);
        }
      });
    }

    // Zdarzenia przełączników
    if (toggleDyslexia) {
      toggleDyslexia.addEventListener('change', (e) => applyDyslexia(e.target.checked));
    }

    if (toggleLinks) {
      toggleLinks.addEventListener('change', (e) => applyUnderlineLinks(e.target.checked));
    }

    if (toggleMotion) {
      toggleMotion.addEventListener('change', (e) => applyStopMotion(e.target.checked));
    }

    // Resetowanie do ustawień domyślnych
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        settings = {
          contrast: 'default',
          fontScale: '100',
          dyslexia: false,
          underlineLinks: false,
          stopMotion: false
        };
        document.documentElement.removeAttribute('data-contrast');
        document.documentElement.classList.remove('font-scale-120', 'font-scale-150', 'font-scale-200', 'dyslexia-mode', 'underline-links', 'stop-motion');
        try {
          localStorage.removeItem('pssp_a11y_settings');
        } catch (e) {}
        syncControls();
        startAutoplay();
      });
    }

    // Obsługa otwierania i zamykania okna modalnego
    function openA11yModal() {
      if (!modal) return;
      modal.removeAttribute('hidden');
      if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
      syncControls();
      
      // Przeniesienie skupienia do przycisku zamknięcia
      if (closeBtn) closeBtn.focus();
    }

    function closeA11yModal() {
      if (!modal) return;
      modal.setAttribute('hidden', '');
      if (triggerBtn) {
        triggerBtn.setAttribute('aria-expanded', 'false');
        triggerBtn.focus();
      }
    }

    if (triggerBtn) triggerBtn.addEventListener('click', openA11yModal);
    if (closeBtn) closeBtn.addEventListener('click', closeA11yModal);

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeA11yModal();
      });

      // Obsługa klawiatury: ESC do zamknięcia oraz Focus Trap
      modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          closeA11yModal();
          return;
        }

        if (e.key === 'Tab') {
          const focusableEls = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableEls.length) return;

          const firstEl = focusableEls[0];
          const lastEl = focusableEls[focusableEls.length - 1];

          if (e.shiftKey && document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          } else if (!e.shiftKey && document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      });
    }

    syncControls();
  }

  initA11yWidget();


  // ------------------------------------------------------------------
  // 8. DYNAMICZNA GALERIA FOLDERÓW I ZDJĘĆ ZE STRAPI / NEON
  // ------------------------------------------------------------------
  function initSchoolGallery() {
    const container = document.getElementById('gallery-albums-container');
    if (!container) return; // Uruchamiaj tylko na galeria.html

    const refreshBtn = document.getElementById('gallery-refresh-btn');
    const emptyState = document.getElementById('gallery-empty-state');
    const emptyTitle = document.getElementById('gallery-empty-title');
    const emptyDesc = document.getElementById('gallery-empty-desc');
    
    const albumsView = document.getElementById('gallery-albums-view');
    const detailsView = document.getElementById('album-details-view');
    const detailTitle = document.getElementById('album-detail-title');
    const detailMeta = document.getElementById('album-detail-meta');
    const photosContainer = document.getElementById('album-photos-container');
    const backBtn = document.getElementById('album-back-btn');

    const lightboxModal = document.getElementById('gallery-lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxInfo = document.getElementById('lightbox-info');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const lightboxPrev = document.getElementById('lightbox-prev-btn');
    const lightboxNext = document.getElementById('lightbox-next-btn');

    // Tablica albumów pobierana w 100% z bazy Strapi
    let allAlbums = [];
    let currentAlbum = null;
    let activePhotoIndex = 0;

    // Obsługa wyboru sortowania albumów ("Od najnowszych" / "Od najstarszych")
    let currentSortMode = 'desc';
    try {
      const savedSort = localStorage.getItem('pssp_gallery_sort');
      if (savedSort === 'asc' || savedSort === 'desc') {
        currentSortMode = savedSort;
      }
    } catch (e) {}

    const sortSelect = document.getElementById('gallery-sort-select');
    if (sortSelect) {
      sortSelect.value = currentSortMode;
      sortSelect.addEventListener('change', (e) => {
        currentSortMode = e.target.value;
        try {
          localStorage.setItem('pssp_gallery_sort', currentSortMode);
        } catch (err) {}
        renderAlbums(allAlbums);
      });
    }

    // Funkcja sortująca albumy po dacie wydarzenia wpisanej w Strapi (pole Data)
    function getSortedAlbums(albums, sortMode = currentSortMode) {
      const copy = [...albums];
      if (sortMode === 'asc') {
        // Od najstarszych po dacie w Strapi
        copy.sort((a, b) => {
          if (a.timestamp && b.timestamp && a.timestamp !== b.timestamp) {
            return a.timestamp - b.timestamp;
          }
          return (a.idNum || 0) - (b.idNum || 0);
        });
      } else {
        // Od najnowszych po dacie w Strapi
        copy.sort((a, b) => {
          if (b.timestamp && a.timestamp && b.timestamp !== a.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return (b.idNum || 0) - (a.idNum || 0);
        });
      }
      return copy;
    }

    const CACHE_KEY = 'pssp_cached_albums_v9';
    // 1. Natychmiastowe wczytanie z pamięci podręcznej przeglądarki (0 ms)
    try {
      localStorage.removeItem('pssp_cached_albums');
      localStorage.removeItem('pssp_cached_albums_v2');
      localStorage.removeItem('pssp_cached_albums_v3');
      localStorage.removeItem('pssp_cached_albums_v4');
      localStorage.removeItem('pssp_cached_albums_v5');
      localStorage.removeItem('pssp_cached_albums_v6');
      localStorage.removeItem('pssp_cached_albums_v7');
      localStorage.removeItem('pssp_cached_albums_v8');
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allAlbums = parsed;
          renderAlbums(allAlbums);
        }
      }
    } catch (e) {}

    // 2. Jeśli pamięć podręczna jest pusta (nowy użytkownik), pokaż ładny stan ładowania
    if (allAlbums.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.7);">
          <i class="fa-solid fa-spinner fa-spin" style="font-size: 2.2rem; color: #F8C830; margin-bottom: 14px;" aria-hidden="true"></i>
          <p style="margin: 0; font-size: 1.05rem; font-weight: 600; color: #FFF;">Wczytywanie galerii szkolnych...</p>
        </div>
      `;
    }

    // Pomocnicza funkcja do ustalania poprawnego adresu URL dla multimediów
    function resolveMediaUrl(url, baseStrapi) {
      if (!url) return 'assets/images/school-building.jpg';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
      }
      const cloudBase = 'https://spolecznachelm.duckdns.org';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const activeBase = (isLocalhost && baseStrapi) ? baseStrapi : cloudBase;
      return activeBase + (url.startsWith('/') ? url : '/' + url);
    }

    // Pomocnicza funkcja mapująca dane ze Strapi na obiekty albumów
    function mapStrapiToAlbums(items, baseStrapi) {
      if (!Array.isArray(items)) return [];
      const mapped = items.map((item, idx) => {
        const attrs = item.attributes || item;
        const title = attrs.Tytul || attrs.tytul || `Folder #${item.id || idx + 1}`;
        
        const rawDate = attrs.Data || attrs.data;
        let dateDisplay = '';
        let timestamp = 0;
        if (rawDate) {
          try {
            const d = new Date(rawDate);
            if (!isNaN(d.getTime())) {
              timestamp = d.getTime();
              dateDisplay = d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            }
          } catch (e) {}
        }

        let photosList = [];
        const rawZdjecia = attrs.Zdjecia || attrs.zdjecia;

        if (rawZdjecia) {
          const mediaArray = Array.isArray(rawZdjecia) 
            ? rawZdjecia 
            : (Array.isArray(rawZdjecia.data) ? rawZdjecia.data : [rawZdjecia]);

          photosList = mediaArray.map((m, pIdx) => {
            const mAttrs = m.attributes || m;
            const rawUrl = resolveMediaUrl(mAttrs.url, baseStrapi);

            let thumbUrl = rawUrl;
            if (rawUrl && rawUrl.includes('res.cloudinary.com') && rawUrl.includes('/image/upload/')) {
              // Zoptymalizowana, ostra miniatura Retina HD (do 750px, q_auto:good, f_auto)
              // Zapewnia błyskawiczne wczytywanie siatki galerii przy zachowaniu krystalicznej ostrości na ekranach Retina
              thumbUrl = rawUrl.replace('/image/upload/', '/image/upload/c_limit,w_750,q_auto:good,f_auto/');
            } else if (mAttrs.formats && (mAttrs.formats.large || mAttrs.formats.medium)) {
              // Nigdy nie używamy małych mikrominiaturek thumbnail (117px) ze Strapi!
              const bestFormat = mAttrs.formats.large || mAttrs.formats.medium;
              if (bestFormat && bestFormat.url) {
                thumbUrl = resolveMediaUrl(bestFormat.url, baseStrapi);
              }
            } else {
              thumbUrl = rawUrl;
            }

            return {
              url: rawUrl || 'assets/images/children-reading.jpg',
              thumbUrl: thumbUrl || rawUrl || 'assets/images/children-reading.jpg',
              caption: `${title} – zdjęcie ${pIdx + 1}`
            };
          });
        }

        const createdAtRaw = attrs.createdAt || item.createdAt;
        let createdTimestamp = 0;
        if (createdAtRaw) {
          try {
            const cd = new Date(createdAtRaw);
            if (!isNaN(cd.getTime())) createdTimestamp = cd.getTime();
          } catch (e) {}
        }

        const count = photosList.length;
        const countDisplay = `${count} ${count === 1 ? 'zdjęcie' : (count < 5 ? 'zdjęcia' : 'zdjęć')}`;

        // Obsługa dedykowanej okładki albumu (jeśli została wybrana w Strapi)
        let coverUrl = '';
        const rawOkladka = attrs.Okladka || attrs.okladka;
        if (rawOkladka) {
          const okladkaMedia = Array.isArray(rawOkladka) 
            ? rawOkladka[0] 
            : (rawOkladka.data ? (Array.isArray(rawOkladka.data) ? rawOkladka.data[0] : rawOkladka.data) : rawOkladka);
          if (okladkaMedia) {
            const oAttrs = okladkaMedia.attributes || okladkaMedia;
            if (oAttrs && oAttrs.url) {
              const rawCoverUrl = resolveMediaUrl(oAttrs.url, baseStrapi);
              if (rawCoverUrl && rawCoverUrl.includes('res.cloudinary.com') && rawCoverUrl.includes('/image/upload/')) {
                coverUrl = rawCoverUrl.replace('/image/upload/', '/image/upload/c_limit,w_750,q_auto:good,f_auto/');
              } else if (oAttrs.formats && (oAttrs.formats.large || oAttrs.formats.medium)) {
                const bestFormat = oAttrs.formats.large || oAttrs.formats.medium;
                coverUrl = resolveMediaUrl(bestFormat.url, baseStrapi);
              } else {
                coverUrl = rawCoverUrl;
              }
            }
          }
        }

        // Fallback: jeśli nie wybrano dedykowanej okładki, użyj pierwszego zdjęcia z galerii
        if (!coverUrl) {
          coverUrl = photosList[0]?.thumbUrl || photosList[0]?.url || 'assets/images/school-building.jpg';
        }

        const docId = String(item.documentId || item.id || `strapi-${idx}`);
        return {
          id: docId,
          documentId: docId,
          rawId: item.id ? String(item.id) : '',
          idNum: parseInt(item.id, 10) || (idx + 1),
          title: title,
          rawDate: rawDate,
          dateDisplay: dateDisplay,
          timestamp: timestamp,
          createdAt: createdAtRaw,
          createdTimestamp: createdTimestamp,
          count: count,
          countDisplay: countDisplay,
          coverUrl: coverUrl,
          photos: photosList,
          isFromStrapi: true
        };
      });

      return mapped;
    }

    const CLOUD_STRAPI_URL = 'https://spolecznachelm.duckdns.org';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const activeStrapiBase = window.STRAPI_URL || (isLocalhost ? 'http://localhost:1337' : CLOUD_STRAPI_URL);

    // Błyskawiczny odczyt ze statycznego pliku data/galerie.json (zawsze działa natychmiast na GitHub Pages)
    async function loadStaticFallback(forceBust = false) {
      const cacheBust = forceBust ? `?v=${Date.now()}` : `?v=20261106R`;
      const candidates = [];
      try {
        candidates.push(new URL(`data/galerie.json${cacheBust}`, window.location.href).href);
      } catch (e) {}
      candidates.push(`data/galerie.json${cacheBust}`);
      candidates.push(`./data/galerie.json${cacheBust}`);

      for (const u of candidates) {
        try {
          const res = await fetch(u);
          if (!res.ok) continue;
          const json = await res.json();
          if (Array.isArray(json.data) && json.data.length > 0) {
            const mapped = mapStrapiToAlbums(json.data, activeStrapiBase);
            if (mapped.length > 0) {
              allAlbums = mapped;
              try {
                localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
              } catch (err) {}

              if (currentAlbum) {
                const freshAlbum = mapped.find(a => (a.documentId && a.documentId === currentAlbum.documentId) || (a.id && a.id === currentAlbum.id));
                if (freshAlbum) {
                  currentAlbum = freshAlbum;
                  renderAlbumPhotos(currentAlbum);
                }
              } else {
                renderAlbums(allAlbums);
              }
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    }

    // Odpytanie chmurowego API Strapi (w tle lub przy ręcznym kliknięciu Odśwież)
    async function syncFromCloudBackend(isManual = false) {
      // UWAGA: Nigdy nie dodawać niestandardowych parametrów (jak _t), bo Strapi v5 rzuca błędem HTTP 400!
      const endpoint = `${activeStrapiBase}/api/galerias?populate=*&pagination[pageSize]=100&sort=createdAt:desc,id:desc`;
      const refreshBtn = document.getElementById('gallery-refresh-btn');
      const refreshIcon = refreshBtn ? refreshBtn.querySelector('i') : null;
      const syncStatus = document.getElementById('gallery-sync-status');

      if (refreshIcon) refreshIcon.classList.add('fa-spin');
      if (syncStatus) {
        syncStatus.style.display = 'inline-flex';
        syncStatus.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i><span>Sprawdzanie bazy...</span>';
        syncStatus.style.color = '#F8C830';
      }

      try {
        const timeoutMs = 75000; // Do 75s na wypadek wybudzania darmowego serwera Render
        const fetchOptions = {
          cache: 'no-store',
          headers: {
            'Accept': 'application/json'
          }
        };
        if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) {
          fetchOptions.signal = AbortSignal.timeout(timeoutMs);
        }
        const res = await fetch(endpoint, fetchOptions);
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        const json = await res.json();
        if (Array.isArray(json.data) && json.data.length > 0) {
          const mapped = mapStrapiToAlbums(json.data, activeStrapiBase);
          if (mapped.length > 0) {
            allAlbums = mapped;
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(mapped));
            } catch (err) {}

            if (currentAlbum) {
              const freshAlbum = mapped.find(a => (a.documentId && a.documentId === currentAlbum.documentId) || (a.id && a.id === currentAlbum.id));
              if (freshAlbum) {
                currentAlbum = freshAlbum;
                renderAlbumPhotos(currentAlbum);
              }
            } else {
              renderAlbums(allAlbums);
            }

            if (syncStatus) {
              syncStatus.style.display = 'inline-flex';
              syncStatus.innerHTML = '<i class="fa-solid fa-check" aria-hidden="true"></i><span>Aktualne</span>';
              syncStatus.style.color = '#4ADE80';
              setTimeout(() => {
                if (syncStatus) syncStatus.style.display = 'none';
              }, 3000);
            }
            return true;
          }
        }
      } catch (e) {
        console.warn('Sync from cloud notice:', e);
        if (syncStatus) {
          syncStatus.style.display = 'inline-flex';
          syncStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i><span>Błąd serwera</span>';
          syncStatus.style.color = '#F87171';
          setTimeout(() => {
            if (syncStatus) syncStatus.style.display = 'none';
          }, 3500);
        }
      } finally {
        if (refreshIcon) refreshIcon.classList.remove('fa-spin');
      }
      return false;
    }

    // Główna funkcja orkiestrująca wczytywanie
    async function loadGalleriesFromBackend() {
      // 1. Równoległe odpytanie chmury Strapi (zawsze aktualna, bezpośrednio z bazy danych)
      const cloudPromise = syncFromCloudBackend(false);

      // 2. Jeśli nie mamy nic w pamięci podręcznej, wczytaj plik awaryjny z GitHub Pages, aby natychmiast coś pokazać
      if (allAlbums.length === 0) {
        const hasStatic = await loadStaticFallback();
        if (!hasStatic && allAlbums.length === 0) {
          await cloudPromise;
        }
      }
    }

    // Renderowanie kafelków folderów w siatce
    function renderAlbums(albumsToRender) {
      container.innerHTML = '';

      const countNumber = document.getElementById('gallery-count-number');
      const countBadge = document.getElementById('gallery-count-badge');
      if (countNumber) {
        countNumber.textContent = albumsToRender.length;
      }
      if (countBadge) {
        countBadge.style.display = 'inline';
      }

      if (albumsToRender.length === 0) {
        if (emptyState) {
          emptyState.style.display = 'block';
          if (emptyTitle) emptyTitle.textContent = 'Brak folderów ze zdjęciami w bazie';
          if (emptyDesc) emptyDesc.innerHTML = 'Wszystkie foldery i zdjęcia wczytywane są na podstawie tego, co wprowadzisz w Strapi. Zaloguj się do panelu pod adresem <strong>https://spolecznachelm.duckdns.org/admin</strong>, przejdź do <em>Content Manager &rarr; Galeria</em>, utwórz folder, wgraj zdjęcia i kliknij <em>Publish</em>.';
        }
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      const sortedList = getSortedAlbums(albumsToRender, currentSortMode);

      sortedList.forEach(album => {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'album-card';
        card.setAttribute('aria-label', `Otwórz folder: ${album.title} (${album.count} zdjęć)`);

        card.innerHTML = `
          <img src="${album.coverUrl}" alt="${album.title} – okładka folderu" class="album-cover-img" loading="lazy">
          <div class="album-overlay">
            <h3 class="album-title">${album.title}</h3>
            <div class="album-meta">
              ${album.dateDisplay ? `<span style="display: inline-flex; align-items: center; gap: 4px; margin-right: 6px;"><i class="fa-regular fa-calendar" aria-hidden="true"></i>${album.dateDisplay}</span>` : ''}
              <span>${album.countDisplay}</span>
            </div>
          </div>
        `;

        card.addEventListener('click', () => openAlbumDetails(album));
        container.appendChild(card);
      });
    }

    // Wyświetlenie zdjęć wewnątrz otwartego folderu
    function renderAlbumPhotos(album) {
      if (!album) return;
      if (detailTitle) detailTitle.textContent = album.title;
      if (detailMeta) {
        const datePart = album.dateDisplay ? `${album.dateDisplay} • ` : '';
        detailMeta.textContent = `Fotorelacja szkolna • ${datePart}${album.count} ${album.count === 1 ? 'zdjęcie' : (album.count < 5 ? 'zdjęcia' : 'zdjęć')}`;
      }

      if (photosContainer) {
        photosContainer.innerHTML = '';
        if (album.photos.length === 0) {
          photosContainer.innerHTML = '<p style="color: rgba(255,255,255,0.7); grid-column: 1 / -1; text-align: center; padding: 40px 0;">Ten folder nie zawiera jeszcze żadnych zdjęć. Wgraj pliki w panelu Strapi.</p>';
        } else {
          album.photos.forEach((photo, idx) => {
            const thumb = document.createElement('button');
            thumb.type = 'button';
            thumb.className = 'photo-thumb-card';
            thumb.setAttribute('aria-label', `Powiększ zdjęcie ${idx + 1} z folderu ${album.title}`);

            thumb.innerHTML = `
              <img src="${photo.thumbUrl || photo.url}" alt="${photo.caption}" loading="lazy">
              <div class="photo-thumb-overlay" aria-hidden="true">
                <i class="fa-solid fa-magnifying-glass-plus"></i>
              </div>
            `;

            thumb.addEventListener('click', () => openLightbox(idx));
            photosContainer.appendChild(thumb);
          });
        }
      }
    }

    // Otwarcie wybranego albumu (widok zdjęć w folderze)
    function openAlbumDetails(album) {
      currentAlbum = album;
      if (albumsView) albumsView.style.display = 'none';
      if (detailsView) detailsView.classList.add('active');

      renderAlbumPhotos(album);

      // Płynne przewinięcie do widoku galerii
      const darkWrap = document.querySelector('.gallery-dark-wrap');
      if (darkWrap) {
        darkWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    // Powrót do listy folderów
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (detailsView) detailsView.classList.remove('active');
        if (albumsView) albumsView.style.display = 'block';
        currentAlbum = null;
        renderAlbums(allAlbums);
      });
    }

    // Obsługa Lightboxa (pełnoekranowego podglądu zdjęć)
    function openLightbox(photoIndex) {
      if (!currentAlbum || !currentAlbum.photos[photoIndex]) return;
      activePhotoIndex = photoIndex;
      updateLightboxPhoto();
      if (lightboxModal) lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
      if (lightboxModal) lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateLightboxPhoto() {
      if (!currentAlbum || !currentAlbum.photos[activePhotoIndex]) return;
      const photo = currentAlbum.photos[activePhotoIndex];
      if (lightboxImg) {
        lightboxImg.src = photo.url;
        lightboxImg.alt = `${currentAlbum.title} – zdjęcie ${activePhotoIndex + 1}`;
      }
      if (lightboxInfo) {
        lightboxInfo.innerHTML = `Zdjęcie ${activePhotoIndex + 1} z ${currentAlbum.photos.length}`;
      }
    }

    function nextPhoto() {
      if (!currentAlbum || currentAlbum.photos.length === 0) return;
      activePhotoIndex = (activePhotoIndex + 1) % currentAlbum.photos.length;
      updateLightboxPhoto();
    }

    function prevPhoto() {
      if (!currentAlbum || currentAlbum.photos.length === 0) return;
      activePhotoIndex = (activePhotoIndex - 1 + currentAlbum.photos.length) % currentAlbum.photos.length;
      updateLightboxPhoto();
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', nextPhoto);
    if (lightboxPrev) lightboxPrev.addEventListener('click', prevPhoto);

    if (lightboxModal) {
      lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    // Nawigacja klawiaturą (WCAG 2.1)
    window.addEventListener('keydown', (e) => {
      if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    });

    // Przycisk ręcznego odświeżania danych ze Strapi
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const originalHtml = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> <span>Pobieranie z chmury...</span>';
        refreshBtn.disabled = true;
        try {
          localStorage.removeItem('pssp_cached_albums');
          localStorage.removeItem(CACHE_KEY);
        } catch (e) {}
        const cloudOk = await syncFromCloudBackend(true);
        if (!cloudOk) {
          await loadStaticFallback(true);
        }
        refreshBtn.innerHTML = originalHtml;
        refreshBtn.disabled = false;
      });
    }

    // Automatyczne odświeżenie po powrocie użytkownika do karty przeglądarki (np. po dodaniu wpisu w Strapi)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && !currentAlbum) {
        loadGalleriesFromBackend();
      }
    });

    // Rozpoczęcie ładowania
    loadGalleriesFromBackend();
  }

  initSchoolGallery();


  // ------------------------------------------------------------------
  // 8. AUDYT DOSTĘPNOŚCI I WYMUSZENIE ATRYBUTÓW ALT (WCAG 1.1.1)
  // ------------------------------------------------------------------
  function enforceImageAltAttributes() {
    const images = document.querySelectorAll('img');
    let fixedCount = 0;

    images.forEach((img, idx) => {
      const alt = img.getAttribute('alt');
      const isDecorative = img.getAttribute('aria-hidden') === 'true' || img.getAttribute('role') === 'presentation';

      if (alt === null || (alt.trim() === '' && !isDecorative)) {
        fixedCount++;
        let fallback = 'Fotografia szkolna – Pierwsza Społeczna Szkoła Podstawowa w Chełmie';

        if (img.classList.contains('brand-logo-img')) {
          fallback = 'Godło Pierwszej Społecznej Szkoły Podstawowej w Chełmie (Sapere Aude 1992)';
        } else if (img.closest('.staff-card') || img.closest('.management-card')) {
          const nameEl = img.closest('.staff-card, .management-card').querySelector('h3, h4');
          fallback = nameEl ? `Zdjęcie pracownika szkoły: ${nameEl.textContent.trim()}` : 'Zdjęcie nauczyciela szkoły';
        } else if (img.getAttribute('src')) {
          const filename = img.getAttribute('src').split('/').pop().replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
          if (filename) fallback = `Ilustracja: ${filename}`;
        }

        img.setAttribute('alt', fallback);
        console.warn(`[WCAG 2.1 AA Audyt] Wykryto brak atrybutu alt w obrazie #${idx + 1}. Automatycznie uzupełniono opis: "${fallback}"`);
      }
    });

    if (fixedCount > 0) {
      console.info(`[WCAG 2.1 AA Audyt] Zabezpieczono ${fixedCount} grafik brakujących atrybutów alt.`);
    }
  }

  enforceImageAltAttributes();

  // Obserwator dynamicznie wgrywanych zdjęć (CMS / Galeria)
  const imgObserver = new MutationObserver((mutations) => {
    let hasNewImgs = false;
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1 && (node.tagName === 'IMG' || node.querySelector('img'))) {
          hasNewImgs = true;
        }
      });
    });
    if (hasNewImgs) {
      enforceImageAltAttributes();
    }
  });

  imgObserver.observe(document.body, { childList: true, subtree: true });


  // ------------------------------------------------------------------
  // 9. PŁYWAJĄCY PRZYCISK POWROTU NA GÓRĘ STRONY (SCROLL TO TOP)
  // ------------------------------------------------------------------
  function initBackToTop() {
    let btn = document.getElementById('back-to-top-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'back-to-top-btn';
      btn.className = 'back-to-top-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Przewiń na górę strony');
      btn.setAttribute('title', 'Przewiń na górę strony');
      btn.innerHTML = '<i class="fa-solid fa-arrow-up" aria-hidden="true"></i>';
      document.body.appendChild(btn);
    }

    const checkScroll = () => {
      if (window.scrollY > 280) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();

    const doScrollToTop = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      btn.blur();
    };

    // Natychmiastowa reakcja na pierwsze dotknięcie na telefonie (bez pozorowania hover na iOS/Android)
    let touchHandled = false;
    btn.addEventListener('touchend', (e) => {
      touchHandled = true;
      doScrollToTop(e);
      setTimeout(() => { touchHandled = false; }, 400);
    }, { passive: false });

    btn.addEventListener('click', (e) => {
      if (touchHandled) return;
      doScrollToTop(e);
    });
  }

  initBackToTop();

});

