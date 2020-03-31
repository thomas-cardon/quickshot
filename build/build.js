"use strict"

const minify = require('minify');

const builder = require("electron-builder");
const Platform = builder.Platform;

const fs = require('fs'), path = require('path');
console.log('Searching files');

var walkSync = function(dir, filelist) {
  var files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
      filelist.push(path.join(dir + file));
    }
  });
  return filelist;
};

const dir = walkSync(path.join(__dirname, '../src/'), []).filter(x => x.slice(-3) === '.js');

console.log('Reading files');

let _m = x => {
  return new Promise((resolve, reject) => {
    console.log('Compressing', x);
    console.log('new path:', x.replace('src', 'app'));

    minify(x, 'stream', function(error, stream) {
      if (error)
        reject(error);
      else {
        let w = fs.createWriteStream(dir[i].replace('src', 'app'));

        w.on('finish', () => resolve());
        stream.pipe(w);
      }
    });
  });
};

console.log('Compressing JS...');
Promise.all(dir.map(x => _m(x))).then(() => {
  console.log('Done');
}).catch(console.error);

/* Promise is returned
builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: {
   "//": "build options, see https://goo.gl/QQXmcV"
  }
})
  .then(() => {
    // handle result
  })
  .catch((error) => {
    // handle error
  })
  */
