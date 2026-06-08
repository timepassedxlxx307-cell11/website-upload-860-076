(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-overlay');
      var errorBox = player.querySelector('.player-error');
      var source = player.getAttribute('data-m3u8');
      var started = false;
      var hlsInstance = null;

      function showError() {
        if (errorBox) {
          errorBox.textContent = '播放暂时不可用，请稍后再试';
        }
        player.classList.remove('is-playing');
      }

      function playVideo() {
        if (!video || !source) {
          showError();
          return;
        }

        player.classList.add('is-playing');

        if (started) {
          video.play().catch(showError);
          return;
        }

        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(showError);
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(showError);
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
            if (data && data.fatal) {
              showError();
            }
          });
          return;
        }

        video.src = source;
        video.play().catch(showError);
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!started || video.paused) {
            playVideo();
          }
        });
      }

      window.addEventListener('pagehide', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
