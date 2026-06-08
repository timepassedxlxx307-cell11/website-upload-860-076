import { H as Hls } from './hls.js';

function setupPlayer(player) {
  const video = player.querySelector('video');
  const overlay = player.querySelector('[data-player-overlay]');
  const button = player.querySelector('[data-play-button]');

  if (!video) {
    return;
  }

  const source = video.dataset.source;
  let hls = null;
  let ready = false;

  function attachSource() {
    if (ready || !source) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      ready = true;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = source;
    ready = true;
  }

  function play() {
    attachSource();
    video.controls = true;
    overlay?.classList.add('is-hidden');

    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {
        overlay?.classList.remove('is-hidden');
      });
    }
  }

  button?.addEventListener('click', play);
  overlay?.addEventListener('click', play);

  video.addEventListener('click', () => {
    if (video.paused) {
      play();
    }
  });

  video.addEventListener('ended', () => {
    overlay?.classList.remove('is-hidden');
  });

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.querySelectorAll('[data-player]').forEach(setupPlayer);
