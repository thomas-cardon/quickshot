let leftX, leftY, rightX, rightY, isDown;

const Region = {
  cancel: function(full) {
    if (full) {
      try {
        canvas.remove();

        delete global.ctx;
        delete global.canvas;
      }
      catch(err) {}

      document.body.style.display = 'none';
    }

    Tools.hide();

    Tools._cPushArray = [];
    Tools._cStep = -1;

    document.getElementById('mouseElement').display = 'none';

    document.getElementById('mouseElement').style.top = document.getElementById('mouseElement').style.left = '0px';
    document.getElementById('mouseElement').style.width = document.getElementById('mouseElement').style.height = '0px';
  }
};

function onMouseDownEvent(e) {
  leftX = e.clientX;
  leftY = e.clientY;

  isDown = true;

  document.getElementById('mouseElement').display = 'block';

  document.getElementById('mouseElement').style.left = leftX + 'px';
  document.getElementById('mouseElement').style.top = leftY + 'px';

  console.log('Dragging mouse from X coords: ' + leftX + ', Y coords: ' + leftY);
}

function onMouseMoveEvent(e) {
  if (!isDown) return;

  rightX = e.clientX;
  rightY = e.clientY;

  console.log('Moving to coords: ' + rightX + ', Y coords: ' + rightY);

  document.getElementById('mouseElement').style.width = (rightX - leftX) + 'px';
  document.getElementById('mouseElement').style.height = (rightY - leftY) + 'px';
}

function onMouseUpEvent(e) {
  isDown = false;

  console.log('Stopped to coords: ' + rightX + ', Y coords: ' + rightY);

  global.options = { left: leftX, top: leftY, width: rightX - leftX, height: rightY - leftY };
  if (options.width <= 0 || options.height <= 0)
    return console.log('Error: coordinates are < 0');

  if (!UIEnabled) save();
  else Tools.show();

  document.removeEventListener('mousedown', onMouseDownEvent);
  document.removeEventListener('mousemove', onMouseMoveEvent);
  document.removeEventListener('mouseup', onMouseUpEvent);
}

function select(canvas, imageFormat, tools, firstTime) {
  document.getElementById('container').prepend(canvas);

  global.canvas = canvas;
  global.ctx = canvas.getContext('2d');

  document.addEventListener('mousedown', onMouseDownEvent);
  document.addEventListener('mousemove', onMouseMoveEvent);
  document.addEventListener('mouseup', onMouseUpEvent);

  document.body.style.display = 'block';
}

function save(path = 'clipboard') {
  require('electron').remote.getCurrentWindow().hide();
  require('../controllers/extract-photo')(canvas.toDataURL('image/' + Store["photo-extension"]), options, path);

  Tools.hide();
  Region.cancel(true);
}
