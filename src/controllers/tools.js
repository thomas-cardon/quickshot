global.UIEnabled = true;
const StackBlur = require('stackblur-canvas');
function take() {
  console.dir(Store);
  fullscreenScreenshot('image/' + Store["photo-extension"]).then(canvas => select(canvas, 'image/' + Store["photo-extension"], UIEnabled, true));
}

const Tools = {
  drag: true,
  selectedTool: 'pencil',
  disableLastTool: () => {
    if (!Tools.selectedTool) return;

    Tools[Tools.selectedTool].toggle(document.getElementById(Tools.selectedTool + '-btn'), false);
    selectedTool = null;
  },
  show: () => {
    document.getElementById('tools').style.top = (leftY - 50) + 'px';
    document.getElementById('tools').style.left = leftX + 'px';

    document.getElementById('tools').style.display = 'block';
    document.getElementById('text').style.width = (rightX - leftX - 44) + 'px';

    document.getElementById('text-tools').style.display = 'block';
    document.getElementById('text-form').style.display = 'block';

    document.getElementById('text-tools').style.top = leftY + 'px';
    document.getElementById('text-tools').style.left = (rightX + 20) + 'px';

    document.getElementById('text-form').style.top = (rightY + 15) + 'px';
    document.getElementById('text-form').style.left = leftX + 'px';

    document.getElementById('text').style.width = (rightX - leftX - 44) + 'px';
  },
  hide: () => {
    document.getElementById('tools').style.display = 'none';
    document.getElementById('text-tools').style.display = 'none';
    document.getElementById('text-form').style.display = 'none';

    Tools.disableLastTool();
  },
  inBounds: function(x, y) {
    if (x < Region.coordinates.left || x >= Region.coordinates.right) return false;
    if (y < Region.coordinates.top || y >= Region.coordinates.bottom) return false;

    return true;
  },
  getMaximumInBoundsCoordinates(x, y) {
    if (x < Region.coordinates.left)
      x = Region.coordinates.left + 1;
    else if (x >= Region.coordinates.right)
      x = Region.coordinates.right - 1;

    if (y < Region.coordinates.top)
      y = Region.coordinates.top + 1;
    else if (y >= Region.coordinates.bottom)
      y = Region.coordinates.bottom - 1;

    return { x, y };
  },
  crop: () => {
    Region.cancel(false);
    Tools.undoredo.reset();
    Tools.hide();

    select(canvas, 'image/' + Store["photo-extension"], true);
  },
  undoredo: {
    _cPushArray: [],
    _cStep: -1,
    _cPush: () => {
      Tools.undoredo._cStep++;
      if (Tools.undoredo._cStep < Tools.undoredo._cPushArray.length) { Tools.undoredo._cPushArray.length = Tools.undoredo._cStep; }
      Tools.undoredo._cPushArray.push(canvas.toDataURL());
    },
    undo: () => {
      if (Tools.undoredo._cStep <= 0) return Tools.undoredo._cStep = 0;
      Tools.undoredo._cStep--;
      var canvasPic = new Image();
      canvasPic.src = Tools.undoredo._cPushArray[Tools.undoredo._cStep];
      canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); };
    },
    redo: () => {
      if (Tools.undoredo._cStep < Tools.undoredo._cPushArray.length - 1) {
          Tools.undoredo._cStep++;
          var canvasPic = new Image();
          canvasPic.src = Tools.undoredo._cPushArray[Tools.undoredo._cStep];
          canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); };
      }
    },
    reset: () => {
      Tools.undoredo._cStep = 1;
      Tools.undoredo._cPushArray[Tools.undoredo._cPushArray[0]];

      Tools.undoredo.undo();
    }
  },
  arrow: {
    toggle: function(el, toggle = !el.disabled) {
      el.classList[toggle ? 'add' : 'remove']('active');

      if (toggle) {
        Tools.disableLastTool();
        Tools.selectedTool = 'arrow';

        document.addEventListener('mousedown', Tools.arrow.onMouseDownEvent);
        document.addEventListener('mouseup', Tools.arrow.onMouseUpEvent);
      }
      else {
        document.removeEventListener('mousedown', Tools.arrow.onMouseDownEvent);
        document.removeEventListener('mouseup', Tools.arrow.onMouseUpEvent);
      }
    },
    onMouseUpEvent: (e) => {
      if (!Tools.inBounds(e.clientX, e.clientY)) return console.log('Out of bounds error!');

      ctx.beginPath();
      ctx.arrow(Tools.arrow.ox, Tools.arrow.oy, e.clientX, e.clientY, [0, 1, -10, 1, -10, 5]);
      ctx.fill();

      Tools.disableLastTool();
    },
    onMouseDownEvent: (e) => {
      if (!Tools.inBounds(Tools.arrow.ox, Tools.arrow.oy)) return console.log('Out of bounds error!');

      Tools.arrow.ox = e.clientX;
      Tools.arrow.oy = e.clientY;
      Tools.undoredo._cPush();
    }
  },
  blur: {
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    w: 0,
    h: 0,
    toggle: function(el, toggle = !el.disabled) {
      el.classList[toggle ? 'add' : 'remove']('active');

      if (toggle) {
        Tools.disableLastTool();
        Tools.selectedTool = 'blur';

        Tools.blur.div = document.createElement('div');
        Tools.blur.div.style.position = 'absolute';
        Tools.blur.div.style.border = '3px dotted #000';
        Tools.blur.div.style['z-index'] = '2000';

        document.body.append(Tools.blur.div);

        document.body.addEventListener('mousedown', Tools.blur.onMouseDownEvent);
        document.body.addEventListener('mouseup', Tools.blur.onMouseUpEvent);
        document.body.addEventListener('mousemove', Tools.blur.onMouseMoveEvent);
      }
      else {
        document.body.removeEventListener('mousedown', Tools.blur.onMouseDownEvent);
        document.body.removeEventListener('mouseup', Tools.blur.onMouseUpEvent);
        document.body.removeEventListener('mousemove', Tools.blur.onMouseMoveEvent);
      }
    },
    onMouseUpEvent: (e) => {
      console.log('Blur >> Stopped');
      Tools.blur.isDown = false;

      Tools.blur.div.remove();
      Tools.undoredo._cPush();

      try {
        console.log(`Blur >> Enabling at X: ${Tools.blur.x} Y: ${Tools.blur.y} Width: ${Tools.blur.w} Height: ${Tools.blur.h} Radius: 15`);
        StackBlur.canvasRGBA(canvas, Tools.blur.x, Tools.blur.y, Tools.blur.w, Tools.blur.h, 15);
      }
      catch(err) {
        console.error(err);
      }

      Tools.disableLastTool();
    },
    onMouseMoveEvent: (e) => {
      if (!Tools.blur.isDown) return;
      let sizeCoords = Tools.getMaximumInBoundsCoordinates(e.screenX, e.screenY);

      Tools.blur.x2 = sizeCoords.x;
      Tools.blur.y2 = sizeCoords.y;

      Tools.blur.recalculate(Tools.blur.div, Tools.blur.x1, Tools.blur.x2, Tools.blur.y1, Tools.blur.y2);
    },
    onMouseDownEvent: (e) => {
      let sizeCoords = Tools.getMaximumInBoundsCoordinates(e.screenX, e.screenY);

      Tools.blur.isDown = true;

      Tools.blur.x1 = sizeCoords.x;
      Tools.blur.y1 = sizeCoords.y;

      Tools.blur.recalculate(Tools.blur.div, Tools.blur.x1, Tools.blur.x2, Tools.blur.y1, Tools.blur.y2);
      Tools.blur.div.style.display = 'block';
    },
    recalculate: (div, x1, x2, y1, y2) => {
      var x3 = Math.min(x1,x2); //Smaller X
      var x4 = Math.max(x1,x2); //Larger X
      var y3 = Math.min(y1,y2); //Smaller Y
      var y4 = Math.max(y1,y2); //Larger Y

      div.style.left = (Tools.blur.x = x3) + 'px';
      div.style.top = (Tools.blur.y = y3) + 'px';
      div.style.width = (Tools.blur.w = x4 - x3) + 'px';
      div.style.height = (Tools.blur.h = y4 - y3) + 'px';
    }
  },
  pencil: {
    toggle: function(el, toggle = !el.disabled) {
      el.classList[toggle ? 'add' : 'remove']('active');

      if (toggle) {
        Tools.disableLastTool();
        Tools.selectedTool = 'pencil';

        document.addEventListener('mousedown', Tools.pencil.onMouseDownEvent);
        document.addEventListener('mouseenter', Tools.pencil.setPosition);
        document.addEventListener('mousemove', Tools.pencil.onMouseMoveEvent);
      }
      else {
        document.removeEventListener('mousedown', Tools.pencil.onMouseDownEvent);
        document.removeEventListener('mouseenter', Tools.pencil.setPosition);
        document.removeEventListener('mousemove', Tools.pencil.onMouseMoveEvent);
      }
    },
    onMouseMoveEvent: (e) => {
      if (e.buttons !== 1) return;
      if (!Tools.inBounds(Tools.pencil.x, Tools.pencil.y)) return console.log('Out of bounds error!');

      ctx.beginPath();

      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#c0392b';

      ctx.moveTo(Tools.pencil.x, Tools.pencil.y); // from
      Tools.pencil.setPosition(e);
      ctx.lineTo(Tools.pencil.x, Tools.pencil.y); // to

      ctx.stroke(); // draw it!
    },
    onMouseDownEvent: (e) => {
      Tools.undoredo._cPush();
      Tools.pencil.setPosition(e);
    },
    setPosition: (e) => {
      Tools.pencil.x = e.clientX;
      Tools.pencil.y = e.clientY;
    }
  },
  text: {
    options: { style: 'normal', variant: 'normal', weight: 'normal', size: '30px', family: 'arial', color: 'black' },
    toggle: function(el, toggle = !el.disabled) {
      el.classList[toggle ? 'add' : 'remove']('active');

      if (toggle) {
        Tools.disableLastTool();
        Tools.selectedTool = 'text';

        document.querySelectorAll('.text-options').forEach(x => x.style.display = 'block');
        document.addEventListener('mousedown', Tools.text.onMouseDownEvent);
      }
      else {
        document.querySelectorAll('.text-options').forEach(x => x.style.display = 'none');
        document.removeEventListener('mousedown', Tools.text.onMouseDownEvent);
      }
    },
    onMouseDownEvent: function(e) {
      if (!Tools.inBounds(e.clientX, e.clientY)) return console.log('Out of bounds error!');
      Tools.undoredo._cPush();

      ctx.font = `${Tools.text.options.style} ${Tools.text.options.variant} ${Tools.text.options.weight} ${Tools.text.options.size} ${Tools.text.options.family}`;
      ctx.fillStyle = Tools.text.options.color;
      ctx.textAlign = Tools.text.options.align || "left";

      ctx.fillText(document.getElementById('text').value, e.clientX, e.clientY);
    },
    align: function(el, alignment) {
      Tools.text.options.align = alignment;
      console.log('Text align >> Set to:', alignment);

      Array.from(el.parentElement.children).forEach(x => x.classList.remove('active'));
      el.classList.add('active');
    },
    bold: function(el) {
      if (Tools.text.options.weight === 'normal') {
        Tools.text.options.weight = 'bold';
        el.classList.add('active');
      }
      else {
        Tools.text.options.weight = 'normal';
        el.classList.remove('active');
      }
    },
    italic: function(el) {
      if (Tools.text.options.style === 'normal') {
        Tools.text.options.style = 'italic';
        el.classList.add('active');
      }
      else {
        Tools.text.options.weight = 'normal';
        el.classList.remove('active');
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  if (!UIEnabled) {
    console.log('Tools >> Instant Photo mode. Disabling');
    Tools.show = Tools.hide = function() {};
  }
});
