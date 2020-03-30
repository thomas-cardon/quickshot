const Tools = {
  drag: true,
  inBounds: function(x, y) {
    console.log(x, y);
    if (x < options.left || x >= (options.left + options.width)) return false;
    if (y < options.top  || y >= (options.top + options.height)) return false;

    return true;
  },
  pencil: {
    enabled: false,
    toggle: function(el) {
      this.disabled = !Tools.pencil.enabled;

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
    options: { text: 'Hello World', style: 'normal', variant: 'normal', weight: 'normal', size: '30px', family: 'arial', color: 'black' },
    toggle: function(el) {
      if (!Tools.text.enabled) {
        Tools.text.enabled = true;
        el.classList.add('active');

        document.querySelectorAll('.text-options').forEach(x => x.style.display = 'inline-block');
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

      ctx.fillText(Tools.text.options.text, e.clientX, e.clientY);
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
