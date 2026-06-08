(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-button]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }
        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = parseInt(dot.getAttribute("data-hero-dot"), 10);
                show(index);
                play();
            });
        });
        root.addEventListener("mouseenter", function () {
            window.clearInterval(timer);
        });
        root.addEventListener("mouseleave", play);
        play();
    }

    function initFilters() {
        var list = document.querySelector("[data-card-list]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        var keyword = document.querySelector("[data-filter-keyword]");
        var category = document.querySelector("[data-filter-category]");
        var type = document.querySelector("[data-filter-type]");
        var year = document.querySelector("[data-filter-year]");
        var params = new URLSearchParams(window.location.search);
        if (keyword && params.get("q")) {
            keyword.value = params.get("q");
        }
        function valueOf(input) {
            return input ? input.value.trim().toLowerCase() : "";
        }
        function apply() {
            var key = valueOf(keyword);
            var cat = valueOf(category);
            var kind = valueOf(type);
            var yr = valueOf(year);
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
                var matchKey = !key || haystack.indexOf(key) !== -1;
                var matchCat = !cat || (card.getAttribute("data-category") || "").toLowerCase() === cat;
                var matchType = !kind || (card.getAttribute("data-type") || "").toLowerCase().indexOf(kind) !== -1;
                var matchYear = !yr || (card.getAttribute("data-year") || "").toLowerCase().indexOf(yr) !== -1;
                card.classList.toggle("hidden-card", !(matchKey && matchCat && matchType && matchYear));
            });
        }
        [keyword, category, type, year].forEach(function (item) {
            if (item) {
                item.addEventListener("input", apply);
                item.addEventListener("change", apply);
            }
        });
        apply();
    }

    function createPlayer(videoId, streamUrl, layerId) {
        var video = document.getElementById(videoId);
        var layer = document.getElementById(layerId);
        if (!video || !layer || !streamUrl) {
            return;
        }
        var mounted = false;
        function mount() {
            if (mounted) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            mounted = true;
        }
        function begin() {
            mount();
            video.controls = true;
            layer.classList.add("is-hidden");
            var attempt = video.play();
            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    layer.classList.remove("is-hidden");
                });
            }
        }
        layer.addEventListener("click", begin);
        video.addEventListener("click", function () {
            if (video.paused) {
                begin();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });

    window.MoviePlayer = {
        create: createPlayer
    };
})();
