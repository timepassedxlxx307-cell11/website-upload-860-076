const toggle = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

function setupHeroSlider() {
  const slider = document.querySelector('[data-hero-slider]');
  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
  const prev = slider.querySelector('[data-hero-prev]');
  const next = slider.querySelector('[data-hero-next]');
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === current);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === current);
    });
  }

  function start() {
    stop();
    timer = window.setInterval(() => {
      show(current + 1);
    }, 5000);
  }

  function stop() {
    if (timer) {
      window.clearInterval(timer);
    }
  }

  prev?.addEventListener('click', () => {
    show(current - 1);
    start();
  });

  next?.addEventListener('click', () => {
    show(current + 1);
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
}

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function setupMovieBrowser(browser) {
  const input = browser.querySelector('[data-search-input]');
  const cards = Array.from(browser.querySelectorAll('[data-card]'));
  const buttons = Array.from(browser.querySelectorAll('[data-filter]'));
  const empty = browser.querySelector('[data-empty-state]');
  let activeFilter = 'all';

  function filterCards() {
    const query = normalize(input?.value || '');
    let visible = 0;

    cards.forEach((card) => {
      const text = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year,
        card.dataset.category
      ].join(' '));
      const matchedText = !query || text.includes(query);
      const matchedFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      const show = matchedText && matchedFilter;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    empty?.classList.toggle('is-visible', visible === 0);
  }

  input?.addEventListener('input', filterCards);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      activeFilter = button.dataset.filter || 'all';
      buttons.forEach((item) => item.classList.toggle('is-active', item === button));
      filterCards();
    });
  });

  filterCards();
}

setupHeroSlider();
document.querySelectorAll('[data-browser]').forEach(setupMovieBrowser);
