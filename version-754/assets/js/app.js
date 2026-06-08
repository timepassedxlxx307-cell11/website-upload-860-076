(() => {
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    const updateBackTop = () => {
      backTop.classList.toggle('is-visible', window.scrollY > 360);
    };

    window.addEventListener('scroll', updateBackTop, { passive: true });
    updateBackTop();

    backTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const previous = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(active + 1), 5200);
    };

    const stop = () => {
      if (timer) {
        window.clearInterval(timer);
      }
    };

    previous?.addEventListener('click', () => {
      show(active - 1);
      start();
    });

    next?.addEventListener('click', () => {
      show(active + 1);
      start();
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  document.querySelectorAll('[data-filter-scope]').forEach((scope) => {
    const keywordInput = scope.querySelector('[data-filter-keyword]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const empty = scope.querySelector('[data-empty-state]');

    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');

    if (query && keywordInput && keywordInput.value === '') {
      keywordInput.value = query;
    }

    const filter = () => {
      const keyword = normalize(keywordInput?.value);
      const year = normalize(yearSelect?.value);
      const type = normalize(typeSelect?.value);
      let visible = 0;

      cards.forEach((card) => {
        const search = normalize(card.getAttribute('data-search'));
        const cardYear = normalize(card.getAttribute('data-year'));
        const cardType = normalize(card.getAttribute('data-type'));
        const matchKeyword = !keyword || search.includes(keyword);
        const matchYear = !year || cardYear === year;
        const matchType = !type || cardType.includes(type);
        const matched = matchKeyword && matchYear && matchType;

        card.classList.toggle('hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    };

    [keywordInput, yearSelect, typeSelect].forEach((control) => {
      control?.addEventListener('input', filter);
      control?.addEventListener('change', filter);
    });

    scope.querySelector('[data-filter-reset]')?.addEventListener('click', () => {
      if (keywordInput) {
        keywordInput.value = '';
      }
      if (yearSelect) {
        yearSelect.value = '';
      }
      if (typeSelect) {
        typeSelect.value = '';
      }
      filter();
    });

    filter();
  });
})();
