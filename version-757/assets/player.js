(function () {
    document.querySelectorAll(".player-shell").forEach(function (shell) {
        var video = shell.querySelector("video");
        var cover = shell.querySelector(".player-cover");
        var button = shell.querySelector(".play-button");
        var message = shell.querySelector(".player-message");
        var stream = shell.getAttribute("data-stream");
        var prepared = false;
        var pending = false;
        var hls = null;

        function showMessage(text) {
            if (message) {
                message.textContent = text;
                message.hidden = false;
            }
        }

        function hideMessage() {
            if (message) {
                message.hidden = true;
                message.textContent = "";
            }
        }

        function finishStart() {
            if (!pending) {
                return;
            }
            pending = false;
            hideMessage();
            video.play().catch(function () {
                if (cover) {
                    cover.classList.remove("is-hidden");
                }
                showMessage("暂时无法播放，请稍后重试");
            });
        }

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                video.addEventListener("loadedmetadata", finishStart, { once: true });
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, finishStart);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        showMessage("暂时无法播放，请稍后重试");
                    }
                });
                return;
            }
            video.src = stream;
            video.addEventListener("loadedmetadata", finishStart, { once: true });
        }

        function start(event) {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            if (!stream || !video) {
                showMessage("暂时无法播放，请稍后重试");
                return;
            }
            pending = true;
            video.controls = true;
            if (cover) {
                cover.classList.add("is-hidden");
            }
            prepare();
            if (!hls) {
                finishStart();
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }
        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (!prepared || video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
            video.addEventListener("play", function () {
                if (cover) {
                    cover.classList.add("is-hidden");
                }
            });
        }
    });
})();
