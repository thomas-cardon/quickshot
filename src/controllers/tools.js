global.UIEnabled = true;

function take() {
  console.dir(Store);
  fullscreenScreenshot('image/' + Store["photo-extension"]).then(canvas => select(canvas, 'image/' + Store["photo-extension"], UIEnabled, true));
}

const Tools = {
  drag: true,
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
  },
  hide: () => {
    document.getElementById('tools').style.display = 'none';
    document.getElementById('text-tools').style.display = 'none';
    document.getElementById('text-form').style.display = 'none';

    if (Tools.pencil.enabled)
      Tools.pencil.toggle();

    if (Tools.text.enabled)
      Tools.text.toggle();
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

    fullscreenScreenshot('image/png').then(canvas => select(canvas, 'image/png', true));
  },
  pencil: {
    enabled: false,
    toggle: function(el) {
      this.disabled = !Tools.pencil.enabled;

      if (Tools.text.enabled)
        document.getElementById('text-btn').click();

      if (!Tools.pencil.enabled) {
        Tools.pencil.enabled = true;
        el.classList.add('active');

        document.addEventListener('mousedown', Tools.pencil.setPosition);
        document.addEventListener('mouseenter', Tools.pencil.setPosition);
        document.addEventListener('mousemove', Tools.pencil.onMouseMoveEvent);
      }
      else {
        Tools.pencil.enabled = false;
        el.classList.remove('active');

        document.removeEventListener('mousedown', Tools.pencil.setPosition);
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
    setPosition: (e) => {
      Tools.pencil.x = e.clientX;
      Tools.pencil.y = e.clientY;
    }
  },
  text: {
    enabled: false,
    options: { style: 'normal', variant: 'normal', weight: 'normal', size: '30px', family: 'arial', color: 'black' },
    toggle: function(el) {
      if (Tools.pencil.enabled)
        document.getElementById('pencil-btn').click();

      if (!Tools.text.enabled) {
        Tools.text.enabled = true;
        el.classList.add('active');

        document.querySelectorAll('.text-options').forEach(x => x.style.display = 'block');
        document.addEventListener('mousedown', Tools.text.onMouseDownEvent);
      }
      else {
        Tools.text.enabled = false;
        el.classList.remove('active');

        document.querySelectorAll('.text-options').forEach(x => x.style.display = 'none');
        document.removeEventListener('mousedown', Tools.text.onMouseDownEvent);
      }
    },
    onMouseDownEvent: function(e) {
      if (!Tools.inBounds(e.clientX, e.clientY)) return console.log('Out of bounds error!');

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
