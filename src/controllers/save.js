let leftX, leftY, rightX, rightY, isDown;
let showTools = false;

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

  if (!showTools) {
    document.getElementById('mouseElement').display = 'none';

    document.getElementById('mouseElement').style.top = document.getElementById('mouseElement').style.left = '0px';
    document.getElementById('mouseElement').style.width = document.getElementById('mouseElement').style.height = '0px';
  }
  else {
    document.getElementById('tools').style.top = leftY - 50 + 'px';
    document.getElementById('tools').style.left = leftX + 'px';

    document.getElementById('tools').style.display = 'block';
  }

  global.options = { left: leftX, top: leftY, width: rightX - leftX, height: rightY - leftY };
  if (options.width <= 0 || options.height <= 0)
    return console.log('Error: coordinates are < 0');

  document.removeEventListener('mousedown', onMouseDownEvent);
  document.removeEventListener('mousemove', onMouseMoveEvent);
  document.removeEventListener('mouseup', onMouseUpEvent);

  if (showTools)
    return;

  save();
}

function select(canvas, imageFormat, tools) {
  showTools = tools;

  document.body.style.display = 'block';
  document.getElementById('container').prepend(canvas);

  document.addEventListener('mousedown', onMouseDownEvent);
  document.addEventListener('mousemove', onMouseMoveEvent);
  document.addEventListener('mouseup', onMouseUpEvent);
}

function save() {
  document.body.style.display = 'none';
  document.getElementById('container').innerHTML = '';

  require('../controllers/extract-photo')(canvas.toDataURL('image/png'), options);
}
