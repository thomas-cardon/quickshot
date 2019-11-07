// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let takeScreenshotWindow = null, settingsWindow = null;
const dev = process.argv.includes('--dev');

function createScreenshotWindow(width, height) {
  // Create the browser window.
  takeScreenshotWindow = new BrowserWindow({
    width,
    height,
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

  takeScreenshotWindow.loadFile(path.join(__dirname, '/views/', 'cropper.html'));

  // Emitted when the window is closed.
  takeScreenshotWindow.on('closed', function () {
    console.log('Screenshot window closed');
    takeScreenshotWindow = null
  });
}

function createSettingsWindow(width, height) {
  // Create the browser window.
  settingsWindow = new BrowserWindow({
    width: 400,
    height: 800,
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
  globalShortcut.register('PrintScreen', () => {
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

    console.log('PrintScreen key pressed!');
    if (takeScreenshotWindow === null) createScreenshotWindow(width, height);
    else takeScreenshotWindow.show();
  });

  globalShortcut.register('CommandOrControl+PrintScreen', () => {
    console.log('Settings key pressed!');
    if (settingsWindow === null) createSettingsWindow();
    else settingsWindow.show();
  });
});

app.on('activate', function () {
  if (takeScreenshotWindow === null) createScreenshotWindow();
  else takeScreenshotWindow.show();
});

app.on('window-all-closed', e => e.preventDefault());
