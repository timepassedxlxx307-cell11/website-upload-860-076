(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var input = document.querySelector("[data-filter-input]");
    var type = document.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (initial) {
      input.value = initial;
    }
    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var selectedType = type ? type.value : "";
      cards.forEach(function (card) {
        var text = card.getAttribute("data-search") || "";
        var cardType = card.getAttribute("data-type") || "";
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedType = !selectedType || cardType === selectedType;
        card.classList.toggle("is-hidden", !(matchedKeyword && matchedType));
      });
    }
    input.addEventListener("input", applyFilter);
    if (type) {
      type.addEventListener("change", applyFilter);
    }
    applyFilter();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var button = document.querySelector("[data-play-button]");
  var cover = document.querySelector("[data-player-cover]");
  var attached = false;

  function attach() {
    if (!video || attached) {
      return;
    }
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video._hls = hls;
    } else {
      video.src = streamUrl;
    }
    attached = true;
  }

  function play() {
    if (!video) {
      return;
    }
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.controls = true;
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {
        if (cover) {
          cover.classList.remove("is-hidden");
        }
      });
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }
  if (cover) {
    cover.addEventListener("click", play);
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }
}
