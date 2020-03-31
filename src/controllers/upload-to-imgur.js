async function imgur(el) {
  try {
    require('electron').remote.getCurrentWindow().hide();
    new Notification('Quickshot', {
      body: 'Téléversement sur Imgur'
    })

    let buffer = await require('../controllers/extract-photo')(canvas.toDataURL('image/' + Store["photo-extension"]), options, 'buffer');

    const formData = new FormData();
    formData.append('image', buffer.toString('base64'));
    formData.append('type', 'base64');

    let req = await fetch('https://api.imgur.com/3/upload',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Client-ID 3300b6c95a12eec'
        },
        body: formData
      });

    require('electron').shell.openExternal((await req.json()).data.link);
    el.disabled = false;

    Tools.hide();
    Region.cancel(true);
  }
  catch(err) {
    require('electron').remote.getCurrentWindow().show();
    console.error(err);
  }
}
