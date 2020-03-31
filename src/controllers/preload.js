global.UIEnabled = document.getElementById('tools') !== null;
if (!UIEnabled) {
  console.log('UI >> Instant Photo mode. Disabling functions');
}

global.take = () => fullscreenScreenshot('image/png').then(canvas => select(canvas, 'image/png', UIEnabled, true));
document.addEventListener('DOMContentLoaded', take);
