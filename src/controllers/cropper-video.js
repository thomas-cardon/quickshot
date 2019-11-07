// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { desktopCapturer } = require('electron');

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 *
 * @param callback {Function} callback receives as first parameter the base64 string of the image
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/
function fullscreenScreenshot(callback) {
    var _this = this;
    this.callback = callback;

    this.handleStream = (source, stream) => {
        var video = document.createElement('video');
        video.style.cssText = 'position:absolute;top:0;left:0;';

        console.dir(source);
        console.dir(stream);

        // Event connected to stream
        video.onloadedmetadata = function () {
            // Set video ORIGINAL height (screenshot)
            video.style.height = this.videoHeight + 'px'; // videoHeight
            video.style.width = this.videoWidth + 'px'; // videoWidth

            video.play();
        }

        video.srcObject = stream;
        document.body.appendChild(video);

        this.callback(video);
    };

    this.handleError = console.error;

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        console.log(sources);

        for (const source of sources) {
            // Filter: main screen
            if ((source.name === "Entire screen") || (source.name === "Screen 1") || (source.name === "Screen 2")) {
                try{
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: true,
                        video: {
                            mandatory: {
                                chromeMediaSource: 'desktop',
                                chromeMediaSourceId: source.id,
                                minWidth: 1280,
                                maxWidth: 4000,
                                minHeight: 720,
                                maxHeight: 4000
                            }
                        }
                    });

                    _this.handleStream(source, stream);
                } catch (e) {
                    _this.handleError(e);
                }
            }
        }
    });
}
