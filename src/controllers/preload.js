global.take = _store => {
  global.Store = _store;
  fullscreenScreenshot('image/' + Store["photo-extension"]).then(canvas => select(canvas, 'image/' + Store["photo-extension"], UIEnabled, true));
};
