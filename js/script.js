/**
 * ====================================================================
 * PIERWSZA SPOŁECZNA SZKOŁA PODSTAWOWA W CHEŁMIE
 * Skrypt interaktywny: slider, menu mobilne, modal dokumentów, liczniki
 * ====================================================================
 */

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
            formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> Dziękujemy, ${name}! Twoja wiadomość została pomyślnie wysłana na pocztę sekretariatu (spoleczna_chelm@wp.pl).`;
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

});
