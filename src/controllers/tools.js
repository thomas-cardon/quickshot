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
    console.log(x, y);
    if (x < options.left || x >= (options.left + options.width)) return false;
    if (y < options.top  || y >= (options.top + options.height)) return false;

    return true;
  },
  crop: () => {
    Region.cancel(false);
    Tools.hide();

    select(canvas, 'image/' + Store["photo-extension"], true);
  },
  _cPushArray: [],
  _cStep: -1,
  _cPush: () => {
    Tools._cStep++;
    if (Tools._cStep < Tools._cPushArray.length) { Tools._cPushArray.length = Tools._cStep; }
    Tools._cPushArray.push(canvas.toDataURL());
  },
  undo: () => {
    if (Tools._cStep <= 0) return Tools._cStep = 0;
    Tools._cStep--;
    var canvasPic = new Image();
    canvasPic.src = Tools._cPushArray[Tools._cStep];
    canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); };
  },
  redo: () => {
    if (Tools._cStep < Tools._cPushArray.length - 1) {
        Tools._cStep++;
        var canvasPic = new Image();
        canvasPic.src = Tools._cPushArray[Tools._cStep];
        canvasPic.onload = function () { ctx.drawImage(canvasPic, 0, 0); };
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

      console.dir(e);

      ctx.beginPath();
      ctx.arrow(Tools.arrow.ox, Tools.arrow.oy, e.clientX, e.clientY, [0, 1, -10, 1, -10, 5]);
      ctx.fill();

      Tools.disableLastTool();
    },
    onMouseDownEvent: (e) => {
      if (!Tools.inBounds(Tools.arrow.ox, Tools.arrow.oy)) return console.log('Out of bounds error!');

      Tools.arrow.ox = e.clientX;
      Tools.arrow.oy = e.clientY;
      Tools._cPush();
    }
  },
  blur: {
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
        document.body.addEventListener('mousemove', Tools.blur.onMouseMoveEvent);
      }
      else {
        document.body.removeEventListener('mousedown', Tools.blur.onMouseDownEvent);
        document.body.removeEventListener('mousemove', Tools.blur.onMouseMoveEvent);
      }
    },
    onMouseMoveEvent: (e) => {
      if (e.button !== 1) {
        Tools.blur.div.style.display = 'none';

        Tools._cPush();
        StackBlur.canvasRGBA(canvas, Tools.blur.x1, Tools.blur.x2, Tools.blur.y1, Tools.blur.y2, 25);

        return Tools.disableLastTool();
      }

      let div = Tools.blur.div;

      Tools.blur.x2 = e.clientX;
      Tools.blur.y2 = e.clientY;

      Tools.blur.recalculate(div, Tools.blur.x1, Tools.blur.x2, Tools.blur.y1, Tools.blur.y2);
    },
    onMouseDownEvent: (e) => {
      let div = Tools.blur.div;
      div.style.display = 'block';

      Tools.blur.x1 = e.clientX;
      Tools.blur.y1 = e.clientY;

      Tools.blur.recalculate(div, Tools.blur.x1, Tools.blur.x2, Tools.blur.y1, Tools.blur.y2);
    },
    recalculate: (div, x1, x2, y1, y2) => {
      var x3 = Math.min(x1,x2); //Smaller X
      var x4 = Math.max(x1,x2); //Larger X
      var y3 = Math.min(y1,y2); //Smaller Y
      var y4 = Math.max(y1,y2); //Larger Y
      div.style.left = x3 + 'px';
      div.style.top = y3 + 'px';
      div.style.width = x4 - x3 + 'px';
      div.style.height = y4 - y3 + 'px';
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
      Tools._cPush();
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
      Tools._cPush();

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
