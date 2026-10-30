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
      const isMax = stat.textContent.includes('max');
      const isPlus = stat.textContent.includes('+');
      
      const duration = 1800;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeProgress * target);

        let formatted = current;
        if (isMax) formatted = `max ${current}`;
        else if (isPercent) formatted = `${current}%`;
        else if (isPlus) formatted = `${current}+`;

        stat.textContent = formatted;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          if (isMax) stat.textContent = `max ${target}`;
          else if (isPercent) stat.textContent = `${target}%`;
          else if (isPlus) stat.textContent = `${target}+`;
          else stat.textContent = target;
        }
      }

      requestAnimationFrame(update);
    });
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
  // 5. FORMULARZ KONTAKTOWY
  // ------------------------------------------------------------------
  const contactForm = document.getElementById('school-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      alert(`Dziękujemy, ${name}! Twoja wiadomość została przekazana do sekretariatu Pierwszej Społecznej Szkoły Podstawowej w Chełmie. Odpowiemy niezwłocznie.`);
      contactForm.reset();
    });
  }

});
