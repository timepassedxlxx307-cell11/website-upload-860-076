(function () {
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function getQuery() {
        var params = new URLSearchParams(window.location.search);
        return (params.get("q") || "").trim();
    }

    function card(movie) {
        var tags = Array.isArray(movie.tags) ? movie.tags.join(" ") : "";
        return [
            "<article class=\"movie-card\" data-card data-title=\"", escapeHtml(movie.title), "\" data-tags=\"", escapeHtml(tags), "\" data-year=\"", escapeHtml(movie.year), "\" data-region=\"", escapeHtml(movie.region), "\">",
            "<a class=\"poster\" href=\"", escapeHtml(movie.url), "\" aria-label=\"", escapeHtml(movie.title), "\">",
            "<img src=\"", escapeHtml(movie.cover), "\" alt=\"", escapeHtml(movie.title), "\" loading=\"lazy\">",
            "<span class=\"poster-gradient\"></span><span class=\"poster-play\">▶</span>",
            "<span class=\"type-badge\">", escapeHtml(movie.category), "</span>",
            "<span class=\"year-badge\">", escapeHtml(movie.year), "</span>",
            "</a>",
            "<div class=\"card-body\"><h3><a href=\"", escapeHtml(movie.url), "\">", escapeHtml(movie.title), "</a></h3>",
            "<p>", escapeHtml(movie.oneLine), "</p><div class=\"card-meta\"><span>", escapeHtml(movie.region), "</span><span>", escapeHtml(movie.type), "</span></div></div>",
            "</article>"
        ].join("");
    }

    function render() {
        var input = document.getElementById("search-page-input");
        var status = document.getElementById("search-status");
        var results = document.getElementById("search-results");
        var query = getQuery();
        var data = window.MOVIE_INDEX || [];
        if (input) {
            input.value = query;
        }
        if (!status || !results) {
            return;
        }
        if (!query) {
            status.textContent = "请输入关键词开始搜索";
            results.innerHTML = "";
            return;
        }
        var lower = query.toLowerCase();
        var matches = data.filter(function (movie) {
            return [movie.title, movie.oneLine, movie.region, movie.type, movie.category, movie.year, (movie.tags || []).join(" ")]
                .join(" ")
                .toLowerCase()
                .indexOf(lower) !== -1;
        }).slice(0, 120);
        status.textContent = matches.length ? "搜索结果" : "未找到相关结果";
        results.innerHTML = matches.map(card).join("");
        Array.prototype.forEach.call(results.querySelectorAll("img"), function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-hidden");
            });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", render);
    } else {
        render();
    }
})();
