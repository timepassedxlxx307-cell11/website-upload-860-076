(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupImageErrors();
        setupLocalFilters();
        setupPlayers();
    });

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupImageErrors() {
        Array.prototype.forEach.call(document.querySelectorAll("img"), function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            });
        });
    }

    function setupLocalFilters() {
        Array.prototype.forEach.call(document.querySelectorAll("[data-local-filter]"), function (input) {
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                Array.prototype.forEach.call(document.querySelectorAll("[data-card]"), function (card) {
                    var text = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-tags") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-region") || ""
                    ].join(" ").toLowerCase();
                    card.style.display = text.indexOf(query) === -1 ? "none" : "";
                });
            });
        });
    }

    function setupPlayers() {
        Array.prototype.forEach.call(document.querySelectorAll("[data-player]"), function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector(".play-overlay");
            var source = player.getAttribute("data-src");
            var hls = null;
            var attached = false;
            var parsed = false;

            if (!video || !source || !button) {
                return;
            }

            function attach(onReady) {
                if (attached) {
                    if (parsed || video.canPlayType("application/vnd.apple.mpegurl")) {
                        onReady();
                    } else {
                        video.addEventListener("canplay", onReady, { once: true });
                    }
                    return;
                }
                attached = true;

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", onReady, { once: true });
                    video.load();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        parsed = true;
                        onReady();
                    });
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (!data || !data.fatal || !hls) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                        } else {
                            hls.destroy();
                        }
                    });
                    return;
                }

                video.src = source;
                video.addEventListener("loadedmetadata", onReady, { once: true });
                video.load();
            }

            function playVideo() {
                attach(function () {
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === "function") {
                        attempt.catch(function () {});
                    }
                });
            }

            button.addEventListener("click", function () {
                playVideo();
            });

            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                } else {
                    video.pause();
                }
            });

            video.addEventListener("play", function () {
                player.classList.add("is-started");
            });

            video.addEventListener("pause", function () {
                player.classList.remove("is-started");
            });
        });
    }
})();
