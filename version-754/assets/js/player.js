(() => {
  const players = document.querySelectorAll('[data-player]');

  players.forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play-overlay]');
    const stream = video?.getAttribute('data-stream');
    let hls = null;
    let ready = false;
    let manifestReady = false;

    if (!video || !stream) {
      return;
    }

    const attemptPlay = () => {
      overlay?.classList.add('is-hidden');
      const result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(() => {
          overlay?.classList.remove('is-hidden');
        });
      }
    };

    const attach = () => {
      if (ready) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
          manifestReady = true;
          attemptPlay();
        });
      } else {
        video.src = stream;
        manifestReady = true;
      }

      ready = true;
    };

    const play = () => {
      attach();

      if (manifestReady) {
        attemptPlay();
      } else {
        overlay?.classList.add('is-hidden');
      }
    };

    overlay?.addEventListener('click', play);

    video.addEventListener('click', () => {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      overlay?.classList.add('is-hidden');
    });

    video.addEventListener('ended', () => {
      overlay?.classList.remove('is-hidden');
    });

    window.addEventListener('pagehide', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
