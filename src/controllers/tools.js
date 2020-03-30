const Tools = {
  drag: true,
  pencil: {
    enabled: false,
    toggle: function() {
      if (!Tools.pencil.enabled) {
        Tools.pencil.enabled = true;

        document.addEventListener('mousedown', Tools.pencil.setPosition);
        document.addEventListener('mouseenter', Tools.pencil.setPosition);
        document.addEventListener('mousemove', Tools.pencil.onMouseMoveEvent);
      }
      else {
        Tools.pencil.enabled = false;

        document.removeEventListener('mousedown', Tools.pencil.setPosition);
        document.removeEventListener('mouseenter', Tools.pencil.setPosition);
        document.removeEventListener('mousemove', Tools.pencil.onMouseMoveEvent);
      }
    },
    onMouseMoveEvent: (e) => {
      if (e.buttons !== 1) return;

      console.dir(e);

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
  }
};
