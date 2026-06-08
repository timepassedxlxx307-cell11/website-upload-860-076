(function () {
    function basePath() {
        return document.body.getAttribute("data-base") || "";
    }

    function resolveUrl(url) {
        if (!url) {
            return "#";
        }
        if (/^(https?:)?\/\//.test(url) || url.charAt(0) === "/") {
            return url;
        }
        return basePath() + url;
    }

    function setupMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var nav = document.querySelector(".mobile-nav");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            var open = nav.hasAttribute("hidden");
            if (open) {
                nav.removeAttribute("hidden");
                document.body.classList.add("menu-open");
            } else {
                nav.setAttribute("hidden", "");
                document.body.classList.remove("menu-open");
            }
        });
    }

    function setupHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === index);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(index + 1);
                }, 5200);
            });
        });
        timer = setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupSearch() {
        var form = document.querySelector(".search-form");
        var input = document.querySelector(".search-input");
        var panel = document.querySelector(".search-panel");
        var data = window.SEARCH_MOVIES || [];
        if (!form || !input || !panel || !data.length) {
            return;
        }
        function render(query) {
            var q = query.trim().toLowerCase();
            if (!q) {
                panel.setAttribute("hidden", "");
                panel.innerHTML = "";
                return;
            }
            var matches = data.filter(function (item) {
                return [item.title, item.region, item.type, item.year, item.genre].join(" ").toLowerCase().indexOf(q) !== -1;
            }).slice(0, 8);
            if (!matches.length) {
                panel.setAttribute("hidden", "");
                panel.innerHTML = "";
                return;
            }
            panel.innerHTML = matches.map(function (item) {
                return '<a class="search-result" href="' + resolveUrl(item.url) + '"><img src="' + resolveUrl(item.image) + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.type + ' · ' + item.year) + '</span></span></a>';
            }).join("");
            panel.removeAttribute("hidden");
        }
        input.addEventListener("input", function () {
            render(input.value);
        });
        input.addEventListener("focus", function () {
            render(input.value);
        });
        document.addEventListener("click", function (event) {
            if (!form.contains(event.target) && !panel.contains(event.target)) {
                panel.setAttribute("hidden", "");
            }
        });
    }

    function escapeHtml(text) {
        return String(text || "").replace(/[&<>"]/g, function (ch) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                """: "&quot;"
            }[ch];
        });
    }

    function setupSimpleFilters() {
        document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
            var buttons = Array.prototype.slice.call(scope.querySelectorAll("[data-filter]"));
            var grid = scope.parentElement.querySelector(".filter-grid");
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (btn) {
                        btn.classList.toggle("active", btn === button);
                    });
                    cards.forEach(function (card) {
                        var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year].join(" ");
                        var visible = value === "all" || text.indexOf(value) !== -1;
                        card.style.display = visible ? "" : "none";
                    });
                });
            });
        });
    }

    function setupLibrary() {
        var grid = document.querySelector("[data-library-grid]");
        if (!grid) {
            return;
        }
        var search = document.querySelector("[data-library-search]");
        var year = document.querySelector("[data-library-year]");
        var categoryWrap = document.querySelector("[data-category-filter]");
        var selectedCategory = "";
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        function apply() {
            var q = search ? search.value.trim().toLowerCase() : "";
            var y = year ? year.value : "";
            cards.forEach(function (card) {
                var text = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.year].join(" ").toLowerCase();
                var okQuery = !q || text.indexOf(q) !== -1;
                var okYear = !y || card.dataset.year === y;
                var okCat = !selectedCategory || card.dataset.category === selectedCategory;
                card.style.display = okQuery && okYear && okCat ? "" : "none";
            });
        }
        if (search) {
            search.addEventListener("input", apply);
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q) {
                search.value = q;
            }
        }
        if (year) {
            year.addEventListener("change", apply);
        }
        if (categoryWrap) {
            categoryWrap.addEventListener("click", function (event) {
                var button = event.target.closest("button[data-category]");
                if (!button) {
                    return;
                }
                selectedCategory = button.getAttribute("data-category") || "";
                Array.prototype.slice.call(categoryWrap.querySelectorAll("button")).forEach(function (btn) {
                    btn.classList.toggle("active", btn === button);
                });
                apply();
            });
        }
        apply();
    }

    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var start = document.querySelector(".player-start");
        var hls = null;
        if (!video || !streamUrl) {
            return;
        }
        function attach() {
            if (video.dataset.ready === "1") {
                return;
            }
            video.dataset.ready = "1";
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }
        function play() {
            attach();
            if (start) {
                start.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }
        if (start) {
            start.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (start) {
                start.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHero();
        setupSearch();
        setupSimpleFilters();
        setupLibrary();
    });
})();
