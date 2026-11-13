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
  // 1. GŁÓWNY BANER (HERO SLIDER) – PŁYNNA I NIEZAWODNA ROTACJA
  // ------------------------------------------------------------------
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  const prevBtn = document.getElementById('slider-prev');
  const nextBtn = document.getElementById('slider-next');
  const sliderSection = document.getElementById('glowna');
  let currentSlide = 0;
  let slideInterval = null;
  let isTransitioning = false;
  let isHovered = false;
  let isSectionInView = true;

  // Wstępny załadunek wszystkich zdjęć w pamięci podręcznej przeglądarki
  const bannerImages = [
    'assets/images/banner-jesien-liscie.webp',
    'assets/images/banner-slubowanie.webp',
    'assets/images/banner-szkola-uczniowie.webp',
    'assets/images/banner-teatr.webp',
    'assets/images/banner-wycieczka.webp'
  ];
  bannerImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  function showSlide(index) {
    if (!slides.length) return;
    if (isTransitioning) return;

    let target = index;
    if (target >= slides.length) target = 0;
    else if (target < 0) target = slides.length - 1;

    if (target === currentSlide) return;

    isTransitioning = true;
    currentSlide = target;

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    setTimeout(() => {
      isTransitioning = false;
    }, 650);
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      nextSlide();
      resetAutoplay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      prevSlide();
      resetAutoplay();
    });
  }

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      showSlide(idx);
      resetAutoplay();
    });
  });

  function canAutoplay() {
    if (slides.length <= 1) return false;
    if (document.documentElement.classList.contains('stop-motion')) return false;
    if (document.hidden) return false;
    if (!isSectionInView) return false;
    if (isHovered) return false;
    return true;
  }

  function startAutoplay() {
    clearInterval(slideInterval);
    if (!canAutoplay()) return;
    slideInterval = setInterval(() => {
      if (canAutoplay()) {
        nextSlide();
      }
    }, 5000);
  }

  function stopAutoplay() {
    clearInterval(slideInterval);
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Rozpoczęcie automatycznej zmiany zdjęć
  startAutoplay();

  // Pauza przy najechaniu myszką TYLKO na urządzeniach z prawdziwym kursorem (desktop)
  const isDesktopPointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (sliderSection && isDesktopPointer) {
    sliderSection.addEventListener('mouseenter', () => {
      isHovered = true;
      stopAutoplay();
    });
    sliderSection.addEventListener('mouseleave', () => {
      isHovered = false;
      startAutoplay();
    });
  }

  // Obsługa zmiany karty w przeglądarce i powrotu do okna
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      isHovered = false;
      startAutoplay();
    }
  });

  window.addEventListener('focus', () => {
    isHovered = false;
    startAutoplay();
  });

  // Inteligentne zatrzymywanie rotacji, gdy użytkownik przewinie stronę poniżej banera
  if ('IntersectionObserver' in window && sliderSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isSectionInView = entry.isIntersecting;
        if (isSectionInView) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      });
    }, { threshold: 0.15 });
    observer.observe(sliderSection);
  }

  // Obsługa gestów swipe na smartfonach i tabletach (bez blokowania autoplay)
  if (sliderSection) {
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
  // 2. MENU MOBILNE (HAMBURGER I PRZYCISK ZAMKNIĘCIA "X")
  // ------------------------------------------------------------------
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav-menu');

  if (mainNav) {
    const closeMenu = () => {
      mainNav.classList.remove('open');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'false');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      }
    };

    const openMenu = () => {
      mainNav.classList.add('open');
      if (mobileToggle) {
        mobileToggle.setAttribute('aria-expanded', 'true');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        }
      }
    };

    // Upewnij się, że w pasku bocznym znajduje się widoczny przycisk "X"
    let closeBtn = mainNav.querySelector('.mobile-nav-close-btn');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'mobile-nav-close-btn';
      closeBtn.setAttribute('aria-label', 'Zamknij menu');
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
      mainNav.prepend(closeBtn);
    }

    const handleCloseMenu = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      closeMenu();
      if (closeBtn) closeBtn.blur();
    };

    closeBtn.addEventListener('click', handleCloseMenu);
    closeBtn.addEventListener('touchend', (e) => {
      handleCloseMenu(e);
    }, { passive: false });

    if (mobileToggle) {
      mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (mainNav.classList.contains('open')) {
          closeMenu();
        } else {
          openMenu();
        }
      });
    }

    // Jeśli użytkownik kliknie w link do bieżącej strony lub kotwicę (#), zamknij menu płynnie
    const navLinks = mainNav.querySelectorAll('.nav-link');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#') || href === currentPath || (currentPath === '' && href === 'index.html')) {
          closeMenu();
        }
      });
    });

    document.addEventListener('click', (e) => {
      if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && (!mobileToggle || !mobileToggle.contains(e.target))) {
        closeMenu();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mainNav.classList.contains('open')) {
        closeMenu();
      }
    });

    // Zabezpieczenie przy obrocie urządzenia lub zmianie rozmiaru okna
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && mainNav.classList.contains('open')) {
        closeMenu();
      }
    }, { passive: true });
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
      
      const link = document.createElement('a');
      link.href = 'assets/docs/karta-zgloszenia-kandydata.pdf';
      link.download = 'Karta_Zgloszenia_Kandydata_PSSP_Chelm.pdf';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        modalDownload.innerHTML = '<i class="fa-solid fa-check"></i> Pobrano pomyślnie!';
        setTimeout(() => {
          modalDownload.innerHTML = '<i class="fa-solid fa-download"></i> Pobierz plik PDF';
          closeModal();
        }, 1200);
      }, 500);
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
    let hasHandledInitialUrlAlbum = false;
    let targetDirectParam = '';
    try {
      const params = new URLSearchParams(window.location.search);
      targetDirectParam = (params.get('album') || params.get('folder') || params.get('id') || '').trim();
    } catch (e) {}

    const countNumber = document.getElementById('gallery-count-number');
    const countBadge = document.getElementById('gallery-count-badge');

    function updateGalleryCountBadge(count) {
      if (countNumber && typeof count === 'number' && !isNaN(count)) {
        countNumber.textContent = count;
      }
      if (countBadge) {
        countBadge.style.display = 'inline-flex';
      }
    }

    // Obsługa wyboru sortowania albumów ("Od najnowszych" / "Od najstarszych")
    // Obsługa wyboru sortowania albumów ("Od najnowszych" / "Od najstarszych")
    let currentSortMode = 'desc';
    try {
      const savedSort = localStorage.getItem('pssp_gallery_sort');
      if (savedSort === 'asc' || savedSort === 'desc') {
        currentSortMode = savedSort;
      }
    } catch (e) {}

    const sortSelect = document.getElementById('gallery-sort-select');
    const sortDropdown = document.getElementById('gallery-sort-dropdown');
    const sortTrigger = document.getElementById('gallery-sort-trigger');
    const sortCurrentText = document.getElementById('gallery-sort-current-text');
    const sortOptions = sortDropdown ? sortDropdown.querySelectorAll('.custom-sort-option') : [];

    function updateGallerySortUI(mode) {
      if (sortSelect) sortSelect.value = mode;
      if (sortCurrentText) {
        sortCurrentText.textContent = mode === 'asc' ? 'Od najstarszych' : 'Od najnowszych';
      }
      sortOptions.forEach(opt => {
        const val = opt.getAttribute('data-value');
        const isActive = (val === mode);
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function applyGallerySort(newMode) {
      if (newMode !== 'asc' && newMode !== 'desc') return;
      currentSortMode = newMode;
      try {
        localStorage.setItem('pssp_gallery_sort', currentSortMode);
      } catch (err) {}
      updateGallerySortUI(currentSortMode);
      renderAlbums(allAlbums);
    }

    updateGallerySortUI(currentSortMode);

    if (sortTrigger && sortDropdown) {
      sortTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sortDropdown.classList.contains('open');
        sortDropdown.classList.toggle('open', !isOpen);
        sortTrigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      sortOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.getAttribute('data-value');
          applyGallerySort(val);
          sortDropdown.classList.remove('open');
          sortTrigger.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (e) => {
        if (!sortDropdown.contains(e.target)) {
          sortDropdown.classList.remove('open');
          sortTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => applyGallerySort(sortSelect.value));
      sortSelect.addEventListener('input', () => applyGallerySort(sortSelect.value));
    }

    // Funkcja sortująca albumy po dacie wydarzenia wpisanej w Strapi (pole Data) lub dacie utworzenia
    function getSortedAlbums(albums, sortMode = currentSortMode) {
      return [...albums].sort((a, b) => {
        const timeA = a.timestamp || a.createdTimestamp || 0;
        const timeB = b.timestamp || b.createdTimestamp || 0;
        if (timeA !== timeB) {
          return sortMode === 'asc' ? timeA - timeB : timeB - timeA;
        }
        return sortMode === 'asc' ? (a.idNum || 0) - (b.idNum || 0) : (b.idNum || 0) - (a.idNum || 0);
      });
    }

    const CACHE_KEY = 'pssp_cached_albums_v10';

    // A. Jeśli mamy album wstępnie rozpoznany przez synchroniczny skrypt w <head>
    if (window.__PRELOADED_DIRECT_ALBUM__) {
      hasHandledInitialUrlAlbum = true;
      currentAlbum = window.__PRELOADED_DIRECT_ALBUM__;
      openAlbumDetails(currentAlbum, true, true);
    } else if (targetDirectParam) {
      // Dla pierwszorazowych odwiedzających: natychmiast uzupełnij nagłówek albumu informacją z sesji
      try {
        const savedInfo = sessionStorage.getItem('pssp_active_direct_album_info');
        if (savedInfo) {
          const info = JSON.parse(savedInfo);
          if (info && info.title && detailTitle) {
            detailTitle.textContent = info.title;
            if (detailMeta && info.dateDisplay) {
              detailMeta.textContent = `Fotorelacja szkolna • ${info.dateDisplay}`;
            }
          }
        }
      } catch (e) {}
    }

    // B. Natychmiastowe wczytanie z pamięci podręcznej przeglądarki (0 ms)
    try {
      localStorage.removeItem('pssp_cached_albums');
      localStorage.removeItem('pssp_cached_albums_v2');
      localStorage.removeItem('pssp_cached_albums_v3');
      localStorage.removeItem('pssp_cached_albums_v4');
      localStorage.removeItem('pssp_cached_albums_v5');
      localStorage.removeItem('pssp_cached_albums_v6');
      localStorage.removeItem('pssp_cached_albums_v7');
      localStorage.removeItem('pssp_cached_albums_v8');
      localStorage.removeItem('pssp_cached_albums_v9');
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allAlbums = parsed;
          if (targetDirectParam && !hasHandledInitialUrlAlbum) {
            checkUrlForDirectAlbum(allAlbums, true);
          } else if (!targetDirectParam) {
            renderAlbums(allAlbums);
          }
        }
      }
    } catch (e) {}

    // C. Jeśli pamięć podręczna jest pusta i NIE wchodzimy bezpośrednio do folderu, pokaż stan ładowania listy
    if (allAlbums.length === 0 && !targetDirectParam) {
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
      const cloudBase = 'https://spoleczna-strapi.onrender.com';
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

    const CLOUD_STRAPI_URL = 'https://spoleczna-strapi.onrender.com';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const activeStrapiBase = window.STRAPI_URL || (isLocalhost ? 'http://localhost:1337' : CLOUD_STRAPI_URL);

    // Błyskawiczny odczyt ze statycznego pliku data/galerie.json (zawsze działa natychmiast na GitHub Pages)
    async function loadStaticFallback(forceBust = false) {
      const cacheBust = forceBust ? `?v=${Date.now()}` : `?v=20261110v9`;
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
              } else if (targetDirectParam && !hasHandledInitialUrlAlbum) {
                const matched = checkUrlForDirectAlbum(allAlbums, true);
                if (!matched) {
                  // Czekamy na ewentualny sync z chmury Strapi
                }
              } else {
                renderAlbums(allAlbums);
                checkUrlForDirectAlbum(allAlbums, false);
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

      if (refreshIcon) refreshIcon.classList.add('fa-spin');

      try {
        const timeoutMs = 4000; // Szybki timeout 4s - jeśli chmura jest niedostępna, natychmiast przełącz na GitHub Pages
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
            } else if (targetDirectParam && !hasHandledInitialUrlAlbum) {
              const matched = checkUrlForDirectAlbum(allAlbums, true);
              if (!matched) {
                // Jeśli folder definitywnie nie istnieje, wyłącz tryb direct i pokaż listę albumów
                document.documentElement.classList.remove('direct-album-mode');
                if (detailsView) detailsView.classList.remove('active');
                if (albumsView) albumsView.style.display = 'block';
                renderAlbums(allAlbums);
              }
            } else {
              renderAlbums(allAlbums);
              checkUrlForDirectAlbum(allAlbums, false);
            }
            return true;
          }
        }
      } catch (e) {
        console.warn('Sync from cloud notice:', e);
      } finally {
        if (refreshIcon) refreshIcon.classList.remove('fa-spin');
      }
      return false;
    }

    // Główna funkcja orkiestrująca wczytywanie
    async function loadGalleriesFromBackend() {
      // 1. ZAWSZE natychmiast wczytaj z pliku statycznego GitHub Pages (0 ms czekania dla odwiedzających)
      if (allAlbums.length === 0) {
        await loadStaticFallback(false);
      }

      // 2. W tle z krótkim 4s timeoutem sprawdź czy chmura ma nowsze dane
      syncFromCloudBackend(false);
    }

    function checkUrlForDirectAlbum(albums, isDirectNav = false) {
      if (hasHandledInitialUrlAlbum || !Array.isArray(albums) || albums.length === 0) return null;
      try {
        const params = new URLSearchParams(window.location.search);
        const target = (params.get('album') || params.get('folder') || params.get('id') || '').trim();
        if (!target) return null;

        const clean = decodeURIComponent(target).replace(/^["']|["']$/g, '').trim().toLowerCase();
        if (!clean) return null;

        function normalizeStr(str) {
          return String(str || '')
            .toLowerCase()
            .replace(/[„”"''’«»!?.–—-]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        }

        const normClean = normalizeStr(clean);

        // 1. Szukamy precyzyjnie po unikalnym ID (documentId, id lub rawId ze Strapi)
        // Dzięki temu foldery o tej samej nazwie (np. "Moje podróże" 2026 i 2025) są bezbłędnie rozróżniane!
        let matched = albums.find(a => 
          String(a.documentId || '').toLowerCase() === clean ||
          String(a.id || '').toLowerCase() === clean ||
          String(a.rawId || '').toLowerCase() === clean
        );

        // 2. Jeśli nie dopasowano po ID, szukamy po dokładnym lub znormalizowanym tytule
        if (!matched) {
          const titleMatches = albums.filter(a => {
            const t = String(a.title || '').trim().toLowerCase();
            return t === clean || normalizeStr(t) === normClean;
          });
          if (titleMatches.length > 0) {
            titleMatches.sort((a, b) => (b.timestamp || b.createdTimestamp || 0) - (a.timestamp || a.createdTimestamp || 0));
            matched = titleMatches[0];
          }
        }

        // 3. Fallback: częściowe dopasowanie tytułu (zawieranie słów kluczowych)
        if (!matched) {
          matched = albums.find(a => {
            const normTitle = normalizeStr(a.title);
            return (
              (normClean.length >= 4 && normTitle.includes(normClean)) ||
              (normTitle.length >= 4 && normClean.includes(normTitle))
            );
          });
        }

        if (matched) {
          hasHandledInitialUrlAlbum = true;
          openAlbumDetails(matched, true, isDirectNav);
          return matched;
        }
      } catch (err) {
        console.warn('Błąd otwierania albumu z adresu URL:', err);
      }
      return null;
    }

    // Renderowanie kafelków folderów w siatce
    function renderAlbums(albumsToRender) {
      container.innerHTML = '';
      updateGalleryCountBadge(albumsToRender.length);

      if (albumsToRender.length === 0) {
        if (emptyState) {
          emptyState.style.display = 'block';
          if (emptyTitle) emptyTitle.textContent = 'Brak zdjęć w galerii';
          if (emptyDesc) emptyDesc.innerHTML = 'Aktualnie brak opublikowanych fotorelacji. Zapraszamy wkrótce do obejrzenia zdjęć z życia szkoły.';
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

      if (!currentAlbum && !hasHandledInitialUrlAlbum) {
        checkUrlForDirectAlbum(allAlbums, false);
      }
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

            const isPriority = idx < 4;
            thumb.innerHTML = `
              <img src="${photo.thumbUrl || photo.url}" alt="${photo.caption}" loading="${isPriority ? 'eager' : 'lazy'}" ${isPriority ? 'fetchpriority="high"' : 'decoding="async"'}>
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
    function openAlbumDetails(album, shouldScroll = true, isDirectNav = false) {
      if (!album) return;
      currentAlbum = album;
      document.documentElement.classList.remove('direct-album-mode');
      if (albumsView) albumsView.style.display = 'none';
      if (detailsView) detailsView.classList.add('active');

      renderAlbumPhotos(album);

      // Przewinięcie do widoku galerii
      if (shouldScroll) {
        const darkWrap = document.querySelector('.gallery-dark-wrap');
        if (darkWrap) {
          if (isDirectNav) {
            // Natychmiastowe ustawienie widoku bez sztucznego opóźnienia animacji
            darkWrap.scrollIntoView({ behavior: 'auto', block: 'start' });
          } else {
            requestAnimationFrame(() => {
              darkWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }
        }
      }
    }

    // Powrót do listy folderów
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        document.documentElement.classList.remove('direct-album-mode');
        if (detailsView) detailsView.classList.remove('active');
        if (albumsView) albumsView.style.display = 'block';
        currentAlbum = null;
        targetDirectParam = '';
        hasHandledInitialUrlAlbum = false;
        if (window.history && window.history.replaceState) {
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        }
        renderAlbums(allAlbums);
        const darkWrap = document.querySelector('.gallery-dark-wrap');
        if (darkWrap) {
          darkWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }

    // Obsługa przycisków Wstecz / Dalej w przeglądarce
    window.addEventListener('popstate', () => {
      const params = new URLSearchParams(window.location.search);
      const target = (params.get('album') || params.get('folder') || params.get('id') || '').trim();
      targetDirectParam = target;
      if (!target) {
        document.documentElement.classList.remove('direct-album-mode');
        if (detailsView) detailsView.classList.remove('active');
        if (albumsView) albumsView.style.display = 'block';
        currentAlbum = null;
        renderAlbums(allAlbums);
      } else {
        hasHandledInitialUrlAlbum = false;
        checkUrlForDirectAlbum(allAlbums, true);
      }
    });

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
  // 8B. DYNAMICZNA GAZETKA SZKOLNA ZE STRAPI / NEON
  // ------------------------------------------------------------------
  function initSchoolGazetka() {
    const container = document.getElementById('gazetka-container');
    if (!container) return; // Uruchamiaj tylko na gazetka.html

    const refreshBtn = document.getElementById('gazetka-refresh-btn');
    const emptyState = document.getElementById('gazetka-empty-state');
    const sortSelect = document.getElementById('gazetka-sort-select');
    const countNumber = document.getElementById('gazetka-count-number');
    const countBadge = document.getElementById('gazetka-count-badge');

    const CACHE_KEY = 'pssp_school_gazetka_cache_v2';
    let allGazetkas = [];
    let currentSortMode = 'desc';

    function updateGazetkaCountBadge(count) {
      if (countNumber && typeof count === 'number' && !isNaN(count)) {
        countNumber.textContent = count;
      }
      if (countBadge) {
        countBadge.style.display = 'inline-flex';
      }
    }

    try {
      const savedSort = localStorage.getItem('pssp_gazetka_sort');
      if (savedSort === 'asc' || savedSort === 'desc') {
        currentSortMode = savedSort;
      }
    } catch (e) {}

    // Błyskawiczne wczytanie z pamięci przeglądarki (identycznie jak w galerii – brak skakania licznika)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allGazetkas = parsed;
          renderGazetkas(allGazetkas);
        }
      }
    } catch (e) {}

    const sortDropdown = document.getElementById('gazetka-sort-dropdown');
    const sortTrigger = document.getElementById('gazetka-sort-trigger');
    const sortCurrentText = document.getElementById('gazetka-sort-current-text');
    const sortOptions = sortDropdown ? sortDropdown.querySelectorAll('.custom-sort-option') : [];

    function updateGazetkaSortUI(mode) {
      if (sortSelect) sortSelect.value = mode;
      if (sortCurrentText) {
        sortCurrentText.textContent = mode === 'asc' ? 'Od najstarszych' : 'Od najnowszych';
      }
      sortOptions.forEach(opt => {
        const val = opt.getAttribute('data-value');
        const isActive = (val === mode);
        opt.classList.toggle('active', isActive);
        opt.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function applyGazetkaSort(newMode) {
      if (newMode !== 'asc' && newMode !== 'desc') return;
      currentSortMode = newMode;
      try {
        localStorage.setItem('pssp_gazetka_sort', currentSortMode);
      } catch (err) {}
      updateGazetkaSortUI(currentSortMode);
      renderGazetkas(allGazetkas);
    }

    updateGazetkaSortUI(currentSortMode);

    if (sortTrigger && sortDropdown) {
      sortTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = sortDropdown.classList.contains('open');
        sortDropdown.classList.toggle('open', !isOpen);
        sortTrigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      sortOptions.forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.getAttribute('data-value');
          applyGazetkaSort(val);
          sortDropdown.classList.remove('open');
          sortTrigger.setAttribute('aria-expanded', 'false');
        });
      });

      document.addEventListener('click', (e) => {
        if (!sortDropdown.contains(e.target)) {
          sortDropdown.classList.remove('open');
          sortTrigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', () => applyGazetkaSort(sortSelect.value));
      sortSelect.addEventListener('input', () => applyGazetkaSort(sortSelect.value));
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        loadGazetkasFromBackend(true);
      });
    }

    function resolveMediaUrl(url, baseStrapi) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      const cloudBase = 'https://spoleczna-strapi.onrender.com';
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
      const activeBase = (isLocalhost && baseStrapi) ? baseStrapi : cloudBase;
      return activeBase + (url.startsWith('/') ? url : '/' + url);
    }

    function mapStrapiToGazetkas(items, baseStrapi) {
      if (!Array.isArray(items)) return [];
      return items.map((item, idx) => {
        const attrs = item.attributes || item;
        const title = attrs.Tytul || attrs.tytul || `Gazetka #${item.id || idx + 1}`;

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

        // Okładka
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

        // Plik PDF
        let pdfUrl = '';
        const rawPlik = attrs.Plik || attrs.plik;
        if (rawPlik) {
          const plikMedia = Array.isArray(rawPlik)
            ? rawPlik[0]
            : (rawPlik.data ? (Array.isArray(rawPlik.data) ? rawPlik.data[0] : rawPlik.data) : rawPlik);
          if (plikMedia) {
            const pAttrs = plikMedia.attributes || plikMedia;
            if (pAttrs && pAttrs.url) {
              pdfUrl = resolveMediaUrl(pAttrs.url, baseStrapi);
            }
          }
        }

        // Inteligentny fallback okładki: jeśli nie wgrano osobnej okładki,
        // wygeneruj automatyczną miniaturę pierwszej strony PDF z Cloudinary
        if (!coverUrl && pdfUrl && pdfUrl.includes('res.cloudinary.com') && pdfUrl.endsWith('.pdf')) {
          coverUrl = pdfUrl.replace(/\.pdf$/, '.jpg').replace('/image/upload/', '/image/upload/c_limit,w_750,q_auto:good,f_auto/');
        }

        const createdAtRaw = attrs.createdAt || item.createdAt;
        let createdTimestamp = 0;
        if (createdAtRaw) {
          try {
            const cd = new Date(createdAtRaw);
            if (!isNaN(cd.getTime())) createdTimestamp = cd.getTime();
          } catch (e) {}
        }

        return {
          id: String(item.documentId || item.id || `gazetka-${idx}`),
          idNum: parseInt(item.id, 10) || (idx + 1),
          title: title,
          rawDate: rawDate,
          dateDisplay: dateDisplay,
          timestamp: timestamp,
          createdTimestamp: createdTimestamp,
          coverUrl: coverUrl || 'assets/images/school-building.jpg',
          pdfUrl: pdfUrl
        };
      });
    }

    function getSortedGazetkas(list, mode) {
      return [...list].sort((a, b) => {
        const timeA = a.timestamp || a.createdTimestamp || 0;
        const timeB = b.timestamp || b.createdTimestamp || 0;
        if (timeA !== timeB) {
          return mode === 'asc' ? timeA - timeB : timeB - timeA;
        }
        return mode === 'asc' ? a.idNum - b.idNum : b.idNum - a.idNum;
      });
    }

    function renderGazetkas(gazetkasToRender) {
      container.innerHTML = '';
      updateGazetkaCountBadge(gazetkasToRender.length);

      if (gazetkasToRender.length === 0) {
        if (emptyState) emptyState.style.display = 'block';
        return;
      }

      if (emptyState) emptyState.style.display = 'none';

      const sortedList = getSortedGazetkas(gazetkasToRender, currentSortMode);

      sortedList.forEach(item => {
        const card = document.createElement('a');
        card.className = 'gazetka-card';
        card.setAttribute('aria-label', `Otwórz gazetkę: ${item.title}`);
        
        if (item.pdfUrl) {
          card.href = item.pdfUrl;
          card.target = '_blank';
          card.rel = 'noopener';
        } else {
          card.href = '#';
          card.onclick = (e) => {
            e.preventDefault();
            alert('Plik PDF dla tego wydania nie został jeszcze załączony w panelu Strapi.');
          };
        }

        card.innerHTML = `
          <img src="${item.coverUrl}" alt="${item.title} – okładka wydania" class="gazetka-cover-img" loading="lazy">
          <span class="gazetka-badge-pdf">
            <i class="fa-solid fa-file-pdf" aria-hidden="true"></i> PDF
          </span>
          <div class="gazetka-overlay">
            <h3 class="gazetka-title">${item.title}</h3>
            <div class="gazetka-meta">
              <span class="gazetka-action-cue">
                <span>Czytaj gazetkę</span> <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
              </span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    }

    function areGazetkaListsIdentical(a, b) {
      if (!Array.isArray(a) || !Array.isArray(b)) return false;
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (a[i].id !== b[i].id || a[i].title !== b[i].title || a[i].pdfUrl !== b[i].pdfUrl || a[i].coverUrl !== b[i].coverUrl) {
          return false;
        }
      }
      return true;
    }

    const CLOUD_STRAPI_URL = 'https://spoleczna-strapi.onrender.com';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const activeStrapiBase = window.STRAPI_URL || (isLocalhost ? 'http://localhost:1337' : CLOUD_STRAPI_URL);

    async function loadStaticFallback(forceBust = false) {
      const cacheBust = forceBust ? `?bust=${Date.now()}` : '';
      const candidates = [
        `data/gazetka.json${cacheBust}`,
        `./data/gazetka.json${cacheBust}`
      ];

      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const json = await res.json();
          const items = Array.isArray(json) ? json : (json.data || []);
          if (items.length > 0) {
            const mapped = mapStrapiToGazetkas(items, '');
            if (mapped.length > 0) {
              const changed = !areGazetkaListsIdentical(allGazetkas, mapped);
              allGazetkas = mapped;
              try { localStorage.setItem(CACHE_KEY, JSON.stringify(mapped)); } catch (e) {}
              if (changed || container.children.length === 0) {
                renderGazetkas(allGazetkas);
              }
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    }

    async function loadGazetkasFromBackend(isManualRefresh = false) {
      if (isManualRefresh && refreshBtn) {
        const icon = refreshBtn.querySelector('i');
        if (icon) icon.classList.add('fa-spin');
      }

      // Jeśli jeszcze nic nie wyrenderowaliśmy (np. pierwsze wejście na stronę bez cache), wczytaj natychmiast static fallback
      if (allGazetkas.length === 0) {
        await loadStaticFallback(isManualRefresh);
      }

      try {
        const endpoint = `${activeStrapiBase}/api/gazetkas?populate=*&pagination[pageSize]=100&sort=Data:desc,createdAt:desc`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data || []);

        if (items.length > 0) {
          const mapped = mapStrapiToGazetkas(items, activeStrapiBase);
          const changed = !areGazetkaListsIdentical(allGazetkas, mapped);
          allGazetkas = mapped;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(mapped)); } catch (e) {}
          if (changed || container.children.length === 0) {
            renderGazetkas(allGazetkas);
          }
        }
      } catch (err) {
        if (allGazetkas.length === 0) {
          await loadStaticFallback(false);
        }
      } finally {
        if (isManualRefresh && refreshBtn) {
          const icon = refreshBtn.querySelector('i');
          if (icon) icon.classList.remove('fa-spin');
        }
      }
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        loadGazetkasFromBackend();
      }
    });

    loadGazetkasFromBackend();
  }

  initSchoolGazetka();


  // ------------------------------------------------------------------
  // 8C. DYNAMICZNE AKTUALNOŚCI ZE STRAPI / NEON (aktualnosci.html)
  // ------------------------------------------------------------------
  function initSchoolNews() {
    const container = document.getElementById('news-grid-container');
    if (!container) return; // Uruchamiaj tylko tam, gdzie jest siatka aktualności

    const refreshBtn = document.getElementById('news-refresh-btn');
    const paginationNav = document.getElementById('news-pagination-nav');
    const paginationContainer = document.getElementById('news-pagination');
    const paginationInfo = document.getElementById('news-pagination-info');
    const topPageInfo = document.getElementById('news-top-page-info');
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    const CACHE_KEY = 'pssp_school_news_cache_v10';
    let allNews = [];

    // Czyszczenie starej pamięci podręcznej
    try {
      localStorage.removeItem('pssp_school_news_cache_v1');
      localStorage.removeItem('pssp_school_news_cache_v2');
      localStorage.removeItem('pssp_school_news_cache_v3');
      localStorage.removeItem('pssp_school_news_cache_v4');
      localStorage.removeItem('pssp_school_news_cache_v5');
    } catch (e) {}

    const CLOUD_STRAPI_URL = 'https://spoleczna-strapi.onrender.com';
    const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    const activeStrapiBase = window.STRAPI_URL || (isLocalhost ? 'http://localhost:1337' : CLOUD_STRAPI_URL);

    function formatPolishDate(dateStr) {
      if (!dateStr) return '';
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        const months = [
          'stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
          'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'
        ];
        return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
      } catch (e) {
        return String(dateStr);
      }
    }

    function resolveMediaUrl(url, base) {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
    }

    function mapStrapiToNews(items, baseStrapi) {
      if (!Array.isArray(items)) return [];
      return items.map((item, idx) => {
        const attrs = item.attributes || item;
        const title = (attrs.Tytul || attrs.tytul || 'Aktualność szkolna').trim();
        const rawDate = attrs.Data || attrs.data || attrs.createdAt || '';
        const dateDisplay = formatPolishDate(rawDate);
        const category = (attrs.Kategoria || attrs.kategoria || '').trim();
        const content = (attrs.Opis || attrs.opis || '').trim();

        // Zdjęcie wpisu (zoptymalizowane pod WebP/AVIF, CDN oraz zachowujące proporcje)
        let imageUrl = '';
        let aspectRatio = '';
        const rawPhoto = attrs.Zdjecie || attrs.zdjecie || attrs.Okladka || attrs.okladka;
        if (rawPhoto) {
          const mediaObj = Array.isArray(rawPhoto) ? rawPhoto[0] : (rawPhoto.data ? (Array.isArray(rawPhoto.data) ? rawPhoto.data[0] : rawPhoto.data) : rawPhoto);
          if (mediaObj) {
            const mAttrs = mediaObj.attributes || mediaObj;
            if (mAttrs && mAttrs.url) {
              const rawUrl = resolveMediaUrl(mAttrs.url, baseStrapi);
              let optimizedUrl = rawUrl;
              if (rawUrl && rawUrl.includes('res.cloudinary.com') && rawUrl.includes('/image/upload/')) {
                // Cloudinary CDN: automatyczny nowoczesny format (AVIF/WebP), inteligentna kompresja (q_auto:good)
                // i optymalna szerokość do 900px dla kafelków Retina (zamiast pobierania surowego pliku 10 MB)
                optimizedUrl = rawUrl.replace('/image/upload/', '/image/upload/c_limit,w_900,q_auto:good,f_auto/');
              } else if (mAttrs.formats && (mAttrs.formats.large || mAttrs.formats.medium)) {
                const bestFormat = mAttrs.formats.large || mAttrs.formats.medium;
                if (bestFormat && bestFormat.url) {
                  optimizedUrl = resolveMediaUrl(bestFormat.url, baseStrapi);
                }
              }
              imageUrl = optimizedUrl;
              if (mAttrs.width && mAttrs.height) {
                aspectRatio = `${mAttrs.width} / ${mAttrs.height}`;
              }
            }
          }
        }
        if (!imageUrl) {
          imageUrl = 'assets/images/school-building.jpg';
        }

        // Powiązana galeria (relacja do folderu z galerii lub inteligentne dopasowanie)
        let galleryParam = '';
        const rawGaleria = attrs.Galeria || attrs.galeria;
        if (rawGaleria) {
          const gObj = rawGaleria.data ? (Array.isArray(rawGaleria.data) ? rawGaleria.data[0] : rawGaleria.data) : (Array.isArray(rawGaleria) ? rawGaleria[0] : rawGaleria);
          if (gObj) {
            const gAttrs = gObj.attributes || gObj;
            // ZAWSZE preferujemy unikalny identyfikator (documentId lub id),
            // aby foldery o tej samej nazwie (np. "Moje podróże" z różnych lat)
            // były bezbłędnie i precyzyjnie rozróżniane!
            galleryParam = gObj.documentId || (gAttrs && gAttrs.documentId) || gObj.id || (gAttrs && gAttrs.id) || gAttrs.Tytul || gAttrs.tytul || '';
          }
        }
        if (!galleryParam && title) {
          const normT = title.toLowerCase();
          if (normT.includes('sukces naszych uczniów')) {
            galleryParam = 'a2v7a86vdz384m782v3n4h0z';
          }
        }

        return {
          id: String(item.documentId || item.id || `news-${idx}`),
          title,
          dateDisplay,
          category,
          content,
          imageUrl,
          aspectRatio,
          galleryParam
        };
      });
    }

    let masonryRaf = null;
    function scheduleNewsMasonry() {
      if (masonryRaf) cancelAnimationFrame(masonryRaf);
      masonryRaf = requestAnimationFrame(() => {
        applyNewsMasonry();
      });
    }

    function applyNewsMasonry() {
      if (!container) return;
      const cards = Array.from(container.querySelectorAll('.news-card'));
      if (cards.length === 0) {
        container.style.minHeight = '';
        container.style.height = '';
        return;
      }

      const containerWidth = container.clientWidth;
      const isMobile = window.innerWidth <= 768 || containerWidth < 680;

      if (isMobile) {
        // Na telefonach: 1 naturalna kolumna pionowa w porządku chronologicznym
        container.style.minHeight = '';
        container.style.height = '';
        cards.forEach(card => {
          card.style.position = '';
          card.style.top = '';
          card.style.left = '';
          card.style.width = '100%';
          card.style.marginBottom = '28px';
        });
        return;
      }

      // Układ 2 kolumn w stylu Pinterest / Masonry:
      // Kafelki mają wysokość dopasowaną do tekstu i zapełniają krótszą kolumnę
      const gap = 36;
      const colWidth = Math.floor((containerWidth - gap) / 2);
      const colHeights = [0, 0];

      cards.forEach(card => {
        card.style.position = 'absolute';
        card.style.width = `${colWidth}px`;
        card.style.marginBottom = '0px';

        // Wybór kolumny o mniejszej bieżącej wysokości (Pinterest)
        const targetCol = colHeights[0] <= colHeights[1] ? 0 : 1;
        const left = targetCol === 0 ? 0 : (colWidth + gap);
        const top = colHeights[targetCol];

        card.style.left = `${left}px`;
        card.style.top = `${top}px`;

        const cardHeight = card.offsetHeight;
        colHeights[targetCol] += cardHeight + gap;
      });

      const totalHeight = Math.max(colHeights[0], colHeights[1]);
      container.style.minHeight = '';
      container.style.height = `${totalHeight}px`;
    }

    function renderPagination(totalItems, current) {
      if (!paginationNav || !paginationContainer) return;
      const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

      if (totalPages <= 1) {
        paginationNav.style.display = 'none';
        paginationContainer.innerHTML = '';
        if (paginationInfo) paginationInfo.innerHTML = '';
        if (topPageInfo) {
          topPageInfo.style.display = 'none';
          topPageInfo.innerHTML = '';
        }
        return;
      }

      paginationNav.style.display = 'flex';
      paginationContainer.innerHTML = '';

      // Prosta, czytelna informacja o bieżącej stronie z liczby wszystkich stron ("Strona X z Y")
      const pageInfoHtml = `Strona <strong>${current}</strong> z <strong>${totalPages}</strong>`;
      if (paginationInfo) {
        paginationInfo.innerHTML = pageInfoHtml;
      }
      if (topPageInfo) {
        topPageInfo.innerHTML = pageInfoHtml;
        topPageInfo.style.display = 'block';
      }

      // Przycisk: Pierwsza strona «
      const firstBtn = document.createElement('button');
      firstBtn.type = 'button';
      firstBtn.className = 'pagination-btn';
      firstBtn.setAttribute('aria-label', 'Przejdź do pierwszej strony');
      firstBtn.innerHTML = '<i class="fa-solid fa-angles-left" aria-hidden="true"></i>';
      firstBtn.disabled = (current === 1);
      firstBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToPage(1);
      });
      paginationContainer.appendChild(firstBtn);

      // Przycisk: Poprzednia strona ‹
      const prevBtn = document.createElement('button');
      prevBtn.type = 'button';
      prevBtn.className = 'pagination-btn';
      prevBtn.setAttribute('aria-label', 'Przejdź do poprzedniej strony');
      prevBtn.innerHTML = '<i class="fa-solid fa-angle-left" aria-hidden="true"></i>';
      prevBtn.disabled = (current === 1);
      prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToPage(current - 1);
      });
      paginationContainer.appendChild(prevBtn);

      // Generowanie numerów stron
      let pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (current <= 4) {
          pages = [1, 2, 3, 4, 5, '...', totalPages];
        } else if (current >= totalPages - 3) {
          pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        } else {
          pages = [1, '...', current - 1, current, current + 1, '...', totalPages];
        }
      }

      pages.forEach(p => {
        if (p === '...') {
          const ellipsis = document.createElement('span');
          ellipsis.className = 'pagination-ellipsis';
          ellipsis.textContent = '...';
          paginationContainer.appendChild(ellipsis);
        } else {
          const numBtn = document.createElement('button');
          numBtn.type = 'button';
          numBtn.className = `pagination-btn${p === current ? ' active' : ''}`;
          numBtn.textContent = p;
          numBtn.setAttribute('aria-label', `Strona ${p}`);
          if (p === current) {
            numBtn.setAttribute('aria-current', 'page');
          } else {
            numBtn.addEventListener('click', (e) => {
              e.preventDefault();
              goToPage(p);
            });
          }
          paginationContainer.appendChild(numBtn);
        }
      });

      // Przycisk: Następna strona ›
      const nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'pagination-btn';
      nextBtn.setAttribute('aria-label', 'Przejdź do następnej strony');
      nextBtn.innerHTML = '<i class="fa-solid fa-angle-right" aria-hidden="true"></i>';
      nextBtn.disabled = (current === totalPages);
      nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToPage(current + 1);
      });
      paginationContainer.appendChild(nextBtn);

      // Przycisk: Ostatnia strona »
      const lastBtn = document.createElement('button');
      lastBtn.type = 'button';
      lastBtn.className = 'pagination-btn';
      lastBtn.setAttribute('aria-label', 'Przejdź do ostatniej strony');
      lastBtn.innerHTML = '<i class="fa-solid fa-angles-right" aria-hidden="true"></i>';
      lastBtn.disabled = (current === totalPages);
      lastBtn.addEventListener('click', (e) => {
        e.preventDefault();
        goToPage(totalPages);
      });
      paginationContainer.appendChild(lastBtn);
    }

    function scrollToTop() {
      // 1. Płynne przewijanie do samej góry strony (top: 0)
      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
      } catch (err) {
        window.scrollTo(0, 0);
      }

      // 2. W kolejnej klatce upewniamy się, że scroll nie został przerwany przez silnik przeglądarki
      requestAnimationFrame(() => {
        if (window.scrollY > 0) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      });

      // 3. Dodatkowy strażnik na wypadek przerwania animacji przez doładowanie miniaturek
      setTimeout(() => {
        if (window.scrollY > 40) {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
      }, 120);

      // 4. Bezpiecznik: ostateczne potwierdzenie po 350 ms
      setTimeout(() => {
        if (window.scrollY > 15) {
          window.scrollTo(0, 0);
        }
      }, 350);
    }

    function goToPage(page) {
      const totalPages = Math.ceil(allNews.length / ITEMS_PER_PAGE);
      if (page < 1 || page > totalPages || page === currentPage) return;
      currentPage = page;

      // Zawsze przewijaj na samą górę strony przy przejściu na nową stronę
      scrollToTop();

      renderNews(allNews);
    }

    function renderNews(newsList) {
      if (!Array.isArray(newsList) || newsList.length === 0) {
        container.style.minHeight = '';
        container.style.height = '';
        if (paginationNav) paginationNav.style.display = 'none';
        if (paginationInfo) paginationInfo.innerHTML = '';
        if (topPageInfo) {
          topPageInfo.style.display = 'none';
          topPageInfo.innerHTML = '';
        }
        container.innerHTML = `
          <div id="news-empty-state" class="news-empty-state" style="width: 100%; text-align: center; padding: 60px 20px; background: #fff; border-radius: var(--radius-lg); border: 1px dashed var(--color-border); box-shadow: var(--shadow-sm);">
            <div style="width: 72px; height: 72px; margin: 0 auto 16px; border-radius: 50%; background: rgba(30, 77, 140, 0.08); display: flex; align-items: center; justify-content: center; font-size: 2rem; color: var(--color-primary);">
              <i class="fa-regular fa-newspaper"></i>
            </div>
            <h3 style="font-size: 1.3rem; margin-bottom: 8px; color: var(--color-primary); font-weight: 700;">Aktualności pojawią się wkrótce</h3>
            <p style="color: var(--color-text-muted); max-width: 520px; margin: 0 auto; font-size: 0.95rem; line-height: 1.6;">W tej chwili nie ma jeszcze opublikowanych artykułów. Po dodaniu wpisów w panelu szkolnym pojawią się one automatycznie w tym miejscu.</p>
          </div>
        `;
        return;
      }

      // Paginacja: do 10 wpisów na stronę (5 rzędów x 2 kolumny)
      const totalPages = Math.ceil(newsList.length / ITEMS_PER_PAGE);
      if (currentPage > totalPages) currentPage = Math.max(1, totalPages);

      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const pageItems = newsList.slice(startIndex, endIndex);

      // Zapobiegamy nagłemu zapadnięciu się wysokości kontenera w trakcie podmiany elementów
      if (container.offsetHeight > 0) {
        container.style.minHeight = `${container.offsetHeight}px`;
      }

      container.innerHTML = '';

      pageItems.forEach(news => {
        const article = document.createElement('article');
        article.className = 'news-card';

        const galleryBtnHtml = news.galleryParam
          ? `
            <div class="news-card-footer">
              <a href="galeria.html?album=${encodeURIComponent(news.galleryParam)}" class="btn-more-gallery" data-gallery-target="${news.galleryParam}" data-gallery-title="${(news.title || '').replace(/"/g, '&quot;')}" data-gallery-date="${news.dateDisplay || ''}" title="Przejdź do galerii i otwórz fotorelację">
                <i class="fa-solid fa-images" aria-hidden="true"></i>
                <span>Zobacz fotorelację w galerii</span>
                <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
              </a>
            </div>
          `
          : '';

        article.innerHTML = `
          <div class="news-card-img-wrap">
            <img src="${news.imageUrl}" alt="${news.title}" class="news-card-img" ${news.aspectRatio ? `style="aspect-ratio: ${news.aspectRatio};"` : ''} loading="lazy" decoding="async">
            ${news.category ? `<span class="news-tag">${news.category}</span>` : ''}
          </div>
          <div class="news-card-body">
            ${news.dateDisplay ? `<div class="news-date"><i class="fa-regular fa-calendar" aria-hidden="true"></i> ${news.dateDisplay}</div>` : ''}
            <h3 class="news-card-title">${news.title}</h3>
            <div class="news-excerpt">${news.content}</div>
            ${galleryBtnHtml}
          </div>
        `;

        container.appendChild(article);
      });

      // Ułożenie kafelków w układzie Pinterest oraz obsługa ładowania obrazków
      scheduleNewsMasonry();
      renderPagination(newsList.length, currentPage);

      const imgs = container.querySelectorAll('.news-card-img');
      imgs.forEach(img => {
        if (!img.complete) {
          img.addEventListener('load', scheduleNewsMasonry, { once: true });
          img.addEventListener('error', scheduleNewsMasonry, { once: true });
        }
      });
    }

    window.addEventListener('resize', scheduleNewsMasonry);

    // 1. Pamięć podręczna (0 ms)
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allNews = parsed;
          renderNews(allNews);
        }
      }
    } catch (e) {}

    // 2. Statyczny fallback z pliku JSON (zawsze natychmiastowy na GitHub Pages)
    async function loadStaticFallback(forceBust = false) {
      const cacheBust = `?bust=${Date.now()}`;
      const candidates = [];
      try {
        candidates.push(new URL(`data/aktualnosci.json${cacheBust}`, window.location.href).href);
      } catch (e) {}
      candidates.push(`data/aktualnosci.json${cacheBust}`);
      candidates.push(`./data/aktualnosci.json${cacheBust}`);
      for (const url of candidates) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) continue;
          const json = await res.json();
          const items = Array.isArray(json) ? json : (json.data || []);
          if (items.length > 0) {
            const mapped = mapStrapiToNews(items, '');
            if (mapped.length > 0) {
              allNews = mapped;
              try { localStorage.setItem(CACHE_KEY, JSON.stringify(mapped)); } catch (e) {}
              renderNews(allNews);
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    }

    // 3. Pobieranie na żywo z chmury Strapi
    async function syncFromCloudBackend(isManual = false) {
      try {
        const endpoint = `${activeStrapiBase}/api/aktualnoscs?populate=*&pagination[pageSize]=100&sort=Data:desc,createdAt:desc`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const res = await fetch(endpoint, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }

        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data || []);
        if (items.length > 0) {
          const mapped = mapStrapiToNews(items, activeStrapiBase);
          allNews = mapped;
          try { localStorage.setItem(CACHE_KEY, JSON.stringify(mapped)); } catch (e) {}
          renderNews(allNews);
          return true;
        } else {
          allNews = [];
          try { localStorage.setItem(CACHE_KEY, JSON.stringify([])); } catch (e) {}
          renderNews([]);
          return true;
        }
      } catch (err) {
        if (allNews.length === 0) {
          await loadStaticFallback(true);
        }
      }
      return false;
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const orig = refreshBtn.innerHTML;
        refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> <span>Pobieranie...</span>';
        refreshBtn.disabled = true;
        try { localStorage.removeItem(CACHE_KEY); } catch (e) {}
        const cloudOk = await syncFromCloudBackend(true);
        if (!cloudOk) {
          await loadStaticFallback(true);
        }
        refreshBtn.innerHTML = orig;
        refreshBtn.disabled = false;
      });
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncFromCloudBackend();
      }
    });

    // ZAWSZE natychmiast wczytaj z GitHub Pages
    if (allNews.length === 0) {
      loadStaticFallback(true);
    }

    syncFromCloudBackend();

    // Prefetching danych galerii w tle podczas czytania aktualności (0 ms opóźnienia dla rodziców)
    function prefetchGalleryData() {
      if (window.__galleryDataPrefetched) return;
      window.__galleryDataPrefetched = true;
      fetch('data/galerie.json?v=20261110v9', { priority: 'low' }).catch(() => {});
    }
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchGalleryData, { timeout: 3000 });
    } else {
      setTimeout(prefetchGalleryData, 1500);
    }
  }

  // Delegacja kliknięcia przycisku galerii z aktualności: przekazuje metadane folderu w sesji
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-more-gallery');
    if (!btn) return;
    const target = btn.getAttribute('data-gallery-target');
    const title = btn.getAttribute('data-gallery-title');
    const date = btn.getAttribute('data-gallery-date');
    if (target) {
      try {
        sessionStorage.setItem('pssp_active_direct_album_info', JSON.stringify({
          target: target,
          title: title || '',
          dateDisplay: date || ''
        }));
      } catch (err) {}
    }
  });

  initSchoolNews();


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

  // ------------------------------------------------------------------
  // 10. ELIMINACJA "LEPKIEGO HOVERA" I ZAWIESZONEGO FOKUSU NA EKRANACH DOTYKOWYCH
  // ------------------------------------------------------------------
  function initTouchDeviceFixes() {
    function blurCurrentElement() {
      if (document.activeElement && 
          document.activeElement !== document.body && 
          document.activeElement.tagName !== 'INPUT' && 
          document.activeElement.tagName !== 'TEXTAREA') {
        document.activeElement.blur();
      }
    }

    // Usunięcie stanu hover/focus po stuknięciu palcem
    document.addEventListener('touchend', function() {
      setTimeout(blurCurrentElement, 80);
    }, { passive: true });

    // Przywrócenie czystego stanu po powrocie do karty/okna (np. po zamknięciu PDF)
    window.addEventListener('pageshow', blurCurrentElement);
    window.addEventListener('focus', blurCurrentElement);
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        blurCurrentElement();
      }
    });
  }

  initTouchDeviceFixes();

  // ------------------------------------------------------------------
  // 11. MODAL POWIĘKSZENIA PLAKATÓW / ZDJĘĆ
  // ------------------------------------------------------------------
  function initPosterModal() {
    const modal = document.getElementById('poster-modal');
    if (!modal) return;

    const modalImg = document.getElementById('poster-modal-img');
    const modalCaption = document.getElementById('poster-modal-caption');
    const closeBtn = document.getElementById('poster-modal-close');

    function formatShortCaption(raw) {
      if (!raw) return '';
      let text = String(raw).trim();

      // Odcięcie długich podtytułów i zdań po separatorach (–, —, |, " - ", ":")
      if (text.includes('–')) text = text.split('–')[0].trim();
      else if (text.includes('—')) text = text.split('—')[0].trim();
      else if (text.includes('|')) text = text.split('|')[0].trim();
      else if (text.includes(' - ')) text = text.split(' - ')[0].trim();
      else if (text.includes(':') && text.length > 20) text = text.split(':')[0].trim();

      // Jeśli tekst zawiera zdania z kropką, bierzemy tylko pierwszy zwięzły człon
      if (text.includes('.')) {
        const sentence = text.split('.')[0].trim();
        if (sentence.length > 0) text = sentence;
      }

      // Usunięcie zbędnych przedrostków technicznych z atrybutów alt
      text = text.replace(/^(Plakat\s+(infografika\s+)?|Zdjęcie\s+|Fotografia\s+)/i, '').trim();

      // Krótkie podstawowe informacje dla kluczowych sekcji
      if (/^oferta(\s+edukacyjna)?/i.test(text)) {
        return 'Oferta edukacyjna';
      }
      if (/^teatr(\s+szkolny)?/i.test(text)) {
        return 'Teatr Szkolny „Arabeska”';
      }
      if (/^rekrutacj/i.test(text)) {
        return 'Rekrutacja';
      }
      if (/zbiórk[a-ę]\s*elektrośmieci/i.test(text)) {
        return 'Zbiórka elektrośmieci';
      }

      // Zabezpieczenie przed zbyt długimi zdaniami dla nowych zdjęć
      if (text.length > 60) {
        text = text.slice(0, 60).trim() + '...';
      }

      // Upewnienie się o wielkiej pierwszej literze
      if (text.length > 0) {
        text = text.charAt(0).toUpperCase() + text.slice(1);
      }

      return text;
    }

    const openModal = (src, caption) => {
      if (!modalImg || !src) return;
      const cleanCaption = formatShortCaption(caption);
      modalImg.src = src;
      modalImg.alt = cleanCaption || 'Powiększone zdjęcie';
      if (modalCaption) modalCaption.textContent = cleanCaption;
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (modalImg) modalImg.src = '';
    };

    // Delegacja zdarzeń: działa dla elementów istniejących oraz dodawanych dynamicznie
    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('.btn-poster-zoom, .poster-img-wrap');
      if (!trigger) return;
      // Jeśli kliknięto wewnątrz linku innego niż sam przycisk zoomu
      if (e.target.closest('a') && !e.target.closest('.btn-poster-zoom')) return;
      e.preventDefault();
      const src = trigger.getAttribute('data-src') || trigger.querySelector('img')?.getAttribute('src');
      const caption = trigger.getAttribute('data-caption') || trigger.querySelector('img')?.getAttribute('alt');
      if (src) openModal(src, caption);
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
      });
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }

  initPosterModal();

});

