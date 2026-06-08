(function () {
  function boot(id, source) {
    var box = document.getElementById(id);
    if (!box) {
      return;
    }
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    var button = box.querySelector(".player-start");
    var attached = false;

    function attach() {
      if (attached || !video) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        box.hlsInstance = hls;
      } else {
        video.src = source;
      }
    }

    function start() {
      attach();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
      var playResult = video.play();
      if (playResult && playResult.catch) {
        playResult.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    }
  }

  window.MoviePlayer = {
    boot: boot
  };
})();
