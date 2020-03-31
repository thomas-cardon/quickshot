document.addEventListener("DOMContentLoaded", () => {
  require('emojipanel');
  let panel = new EmojiPanel({
    container: '#container',
    trigger: '#emoji-btn',
    placement: 'right',
    tether: false,
    json_url: '../../node_modules/emojipanel/dist/emojis.json'
  });

  panel.addListener('select', emoji => {
    let el = document.getElementById('text');
    el.value += emoji.char;
    el.onchange();
  });

  panel.addListener('toggle', open => {
    document.getElementById('emoji-btn').classList[open ? 'add' : 'remove']('active');
    panel.reposition();
  });
});
