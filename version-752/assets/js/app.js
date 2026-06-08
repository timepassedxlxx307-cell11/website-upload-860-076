(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function safeText(value) {
        return String(value || "").replace(/[&<>"]/g, function (item) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;"
            }[item];
        });
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");

        if (!toggle || !panel) {
            return;
        }

        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var root = document.querySelector("[data-hero]");

        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        if (slides.length > 1) {
            show(0);
            start();
        }
    }

    function setupCardFilters() {
        Array.prototype.slice.call(document.querySelectorAll("[data-card-filter]")).forEach(function (form) {
            var input = form.querySelector("input");
            var target = document.querySelector(form.getAttribute("data-card-filter"));
            var empty = document.querySelector(form.getAttribute("data-empty-target") || "");

            if (!input || !target) {
                return;
            }

            function filter() {
                var keyword = input.value.trim().toLowerCase();
                var cards = Array.prototype.slice.call(target.querySelectorAll("[data-card]"));
                var visible = 0;

                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search-text") || card.textContent || "").toLowerCase();
                    var matched = !keyword || text.indexOf(keyword) !== -1;
                    card.classList.toggle("hidden-card", !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            form.addEventListener("submit", function (event) {
                event.preventDefault();
                filter();
            });
            input.addEventListener("input", filter);
        });
    }

    function setupSearchPage() {
        var root = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");

        if (!root || !Array.isArray(window.SEARCH_CATALOG)) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";

        if (input) {
            input.value = initial;
        }

        function render(keyword) {
            var normalized = keyword.trim().toLowerCase();
            var matches = window.SEARCH_CATALOG.filter(function (movie) {
                var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
                return !normalized || text.indexOf(normalized) !== -1;
            }).slice(0, 120);

            if (!matches.length) {
                root.innerHTML = '<div class="empty-state">没有找到匹配的影片。</div>';
                return;
            }

            root.innerHTML = matches.map(function (movie) {
                return [
                    '<article class="search-result-card">',
                    '<a href="' + safeText(movie.url) + '"><img src="' + safeText(movie.cover) + '" alt="' + safeText(movie.title) + '"></a>',
                    '<div>',
                    '<h3 class="rank-title"><a href="' + safeText(movie.url) + '">' + safeText(movie.title) + '</a></h3>',
                    '<p class="rank-desc">' + safeText(movie.year) + ' · ' + safeText(movie.region) + ' · ' + safeText(movie.type) + '</p>',
                    '<p class="rank-desc">' + safeText(movie.oneLine) + '</p>',
                    '</div>',
                    '<a class="play-link" href="' + safeText(movie.url) + '">观看</a>',
                    '</article>'
                ].join("");
            }).join("");
        }

        render(initial);

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
    }

    function setupMoviePlayer(videoId, source) {
        var video = document.getElementById(videoId);

        if (!video) {
            return;
        }

        var shell = video.closest(".player-shell");
        var button = shell ? shell.querySelector(".player-start") : null;
        var prepared = false;
        var hlsInstance = null;

        function playVideo() {
            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        function prepareAndPlay() {
            if (shell) {
                shell.classList.add("is-playing");
            }

            if (prepared) {
                playVideo();
                return;
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", playVideo, { once: true });
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 40,
                    backBufferLength: 30
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
                return;
            }

            video.src = source;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
        }

        if (button) {
            button.addEventListener("click", prepareAndPlay);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                prepareAndPlay();
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;

    ready(function () {
        setupNavigation();
        setupHeroCarousel();
        setupCardFilters();
        setupSearchPage();
    });
})();
