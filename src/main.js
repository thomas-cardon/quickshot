// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let takeScreenshotWindow = null, settingsWindow = null;
const dev = process.argv.includes('--dev');

function createScreenshotWindow(width, height, mode = 'photo') {
  // Create the browser window.
  takeScreenshotWindow = new BrowserWindow({
    width,
    height,
    show: false,
    frame: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    transparent: true,
    alwaysOnTop: !dev,
    kiosk: true,
    x: 0,
    y: 0,
    thickFrame: false,
    webPreferences: {
      nodeIntegration: true,
      experimentalFeatures: true
    }
  });

  takeScreenshotWindow.loadFile(path.join(__dirname, '/views/', 'cropper-' + mode + '.html'));

  takeScreenshotWindow.once('ready-to-show', () => takeScreenshotWindow.show());

  takeScreenshotWindow.on('show', () => {
    console.log('>> Screenshot window is now shown. Capturing source');

    takeScreenshotWindow.webContents.executeJavaScript("fullscreenScreenshot('image/png').then(() => select(canvas, 'image/png', true));", true);
  });

  takeScreenshotWindow.on('closed', () => takeScreenshotWindow = null);
}

function createSettingsWindow(width, height) {
  // Create the browser window.
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 700,
    frame: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true
    }
  });

  settingsWindow.loadFile(path.join(__dirname, '/views/', 'settings.html'));

  // Emitted when the window is closed.
  settingsWindow.on('closed', function () {
    settingsWindow = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('>> Ready');

  globalShortcut.register('PrintScreen', () => {
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

    console.log('>> PrintScreen key pressed!');
    if (takeScreenshotWindow === null) createScreenshotWindow(width, height);
    else takeScreenshotWindow.show();
  });

  globalShortcut.register('CommandOrControl+PrintScreen', () => {
    console.log('>> Settings key pressed!');
    if (settingsWindow === null) createSettingsWindow();
    else settingsWindow.show();
  });
});

app.on('activate', function () {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  if (takeScreenshotWindow === null) createScreenshotWindow(width, height);
  else takeScreenshotWindow.show();
});

app.on('window-all-closed', e => e.preventDefault());
