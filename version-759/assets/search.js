(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function unique(values) {
    return Array.prototype.slice.call(new Set(values.filter(Boolean))).sort();
  }

  function card(movie) {
    var tags = [movie.category, movie.type, movie.year].filter(Boolean).map(function (item) {
      return '<span>' + escapeHtml(item) + '</span>';
    }).join('');

    return '' +
      '<article class="movie-card">' +
        '<a class="poster-wrap" href="' + escapeHtml(movie.url) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" onerror="this.remove()">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-badge">▶</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<div class="movie-meta">' + tags + '</div>' +
          '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p>' + escapeHtml(movie.summary) + '</p>' +
          '<div class="card-foot"><span>评分 ' + escapeHtml(movie.rating) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
        '</div>' +
      '</article>';
  }

  ready(function () {
    var data = window.SEARCH_MOVIES || [];
    var form = document.querySelector('[data-search-form]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var summary = document.querySelector('[data-search-summary]');

    if (!form || !results) {
      return;
    }

    var queryInput = form.querySelector('input[name="q"]');
    var typeSelect = form.querySelector('select[name="type"]');
    var regionSelect = form.querySelector('select[name="region"]');
    var params = new URLSearchParams(window.location.search);

    unique(data.map(function (movie) { return movie.type; })).forEach(function (value) {
      typeSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>');
    });

    unique(data.map(function (movie) { return movie.region; })).forEach(function (value) {
      regionSelect.insertAdjacentHTML('beforeend', '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>');
    });

    queryInput.value = params.get('q') || '';
    typeSelect.value = params.get('type') || '';
    regionSelect.value = params.get('region') || '';

    function render() {
      var q = queryInput.value.trim().toLowerCase();
      var type = typeSelect.value;
      var region = regionSelect.value;
      var filtered = data.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.summary].concat(movie.tags || []).join(' ').toLowerCase();
        return (!q || haystack.indexOf(q) !== -1) && (!type || movie.type === type) && (!region || movie.region === region);
      }).slice(0, 120);

      if (title) {
        title.textContent = q || type || region ? '筛选结果' : '热门推荐';
      }

      if (summary) {
        summary.textContent = filtered.length ? '点击影片卡片进入详情页观看。' : '没有找到匹配影片，换个关键词试试。';
      }

      results.innerHTML = filtered.map(card).join('');
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var nextParams = new URLSearchParams();
      if (queryInput.value.trim()) {
        nextParams.set('q', queryInput.value.trim());
      }
      if (typeSelect.value) {
        nextParams.set('type', typeSelect.value);
      }
      if (regionSelect.value) {
        nextParams.set('region', regionSelect.value);
      }
      var nextUrl = window.location.pathname + (nextParams.toString() ? '?' + nextParams.toString() : '');
      window.history.replaceState({}, '', nextUrl);
      render();
    });

    queryInput.addEventListener('input', render);
    typeSelect.addEventListener('change', render);
    regionSelect.addEventListener('change', render);
    render();
  });
})();
