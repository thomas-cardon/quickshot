// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { desktopCapturer } = require('electron');

/**
 * Create a screenshot of the entire screen using the desktopCapturer module of Electron.
 *
 * @param imageFormat {String} Format of the image to generate ('image/jpeg' or 'image/png')
 **/

function fullscreenScreenshot(imageFormat) {
  return new Promise((resolve, reject) => {
    imageFormat = imageFormat || 'image/jpeg';

    function handleStream(stream) {
        // Create hidden video tag
        var video = document.createElement('video');
        video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;';

        // Event connected to stream
        video.onloadedmetadata = async function () {
            // Set video ORIGINAL height (screenshot)
            video.style.height = this.videoHeight + 'px'; // videoHeight
            video.style.width = this.videoWidth + 'px'; // videoWidth

            await video.play();

            // Create canvas
            let canvas = document.createElement('canvas');

            canvas.width = this.videoWidth;
            canvas.height = this.videoHeight;

            canvas.style.position = 'absolute';
            canvas.style.overflow = 'hidden';

            canvas.style.top = '0px';
            canvas.style.left = '0px';

            canvas.style.filter = 'brightness(30%)';

            let ctx = canvas.getContext('2d');

            // Draw video on canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Remove hidden video tag
            video.remove();
            try {
                // Destroy connect to stream
                stream.getTracks()[0].stop();
            } catch (e) {}

            resolve(canvas);
        }

        video.srcObject = stream;
        document.body.appendChild(video);
    };

    desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async sources => {
        console.log(sources);

        for (const source of sources) {
            // Filter: main screen
            if (source.id === 'screen:1:0' || source.name === "Entire Screen" || source.name === "Entire screen" || source.name === "Screen 1" || source.name === "Screen 2") {
              console.log('Acquired source', source.name);

                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        audio: false,
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

                    console.log('Acquired stream');

                    return handleStream(stream);
                } catch (e) {
                    console.error(err);
                    reject(e);
                }
            }
        }
    }).catch(err => {
      console.error(err);
      reject(err);
    });
  });
}
