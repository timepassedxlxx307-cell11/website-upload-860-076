(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobilePanel = document.querySelector(".mobile-panel");
    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobilePanel.classList.toggle("open");
            document.body.classList.toggle("menu-open", isOpen);
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll(".site-search").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (!value) {
                event.preventDefault();
                window.location.href = "./search.html";
            }
        });
    });

    var slider = document.querySelector(".hero-slider");
    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var prev = slider.querySelector(".hero-control.prev");
        var next = slider.querySelector(".hero-control.next");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });
        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector(".movie-filter-input");
    if (filterInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
        var empty = document.querySelector(".filter-empty");

        function applyFilter() {
            var query = filterInput.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var text = card.getAttribute("data-filter") || "";
                var matched = !query || text.indexOf(query) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        var params = new URLSearchParams(window.location.search);
        var preset = params.get("q");
        if (preset) {
            filterInput.value = preset;
        }
        filterInput.addEventListener("input", applyFilter);
        applyFilter();
    }
})();
