// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut } = require('electron')
const path = require('path')

/* Command line parameters */
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let takeScreenshotWindow, mode, settingsWindow;
const dev = process.argv.includes('--dev');

function createScreenshotWindow(width, height, page = 'photo') {
  mode = page;

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
    hasShadow: false,
    alwaysOnTop: !dev,
    kiosk: true,
    x: 0,
    y: 0,
    thickFrame: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      experimentalFeatures: true,
      allowRunningInsecureContent: true,
      preload: path.join(__dirname, 'controllers\\preload.js')
    }
  });

  takeScreenshotWindow.loadFile(path.join(__dirname, '/views/', 'ui-' + mode + '.html'));

  takeScreenshotWindow.once('ready-to-show', () => takeScreenshotWindow.show());

  takeScreenshotWindow.on('show', () => {
    console.log('>> Screenshot window is now shown. Capturing source');

    takeScreenshotWindow.webContents.executeJavaScript("take();", true);
  });
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

  settingsWindow.loadFile(path.join(__dirname, '/views/', 'ui-settings.html'));

  // Emitted when the window is closed.
  settingsWindow.on('closed', function () {
    settingsWindow = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  console.log('>> Ready, Electron:', process.versions.electron);

  globalShortcut.register('PrintScreen', () => {
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

    console.log('>> PrintScreen key pressed!');
    if (takeScreenshotWindow && !takeScreenshotWindow.isDestroyed() && mode !== 'photo') {
      takeScreenshotWindow.destroy();
      createScreenshotWindow(width, height, 'photo');
    }
    else if (!takeScreenshotWindow || takeScreenshotWindow.isDestroyed()) createScreenshotWindow(width, height, 'photo');
    else takeScreenshotWindow.show();
  });

  globalShortcut.register('Shift+PrintScreen', () => {
    const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

    console.log('>> Shift+PrintScreen key pressed!');
    if (takeScreenshotWindow && !takeScreenshotWindow.isDestroyed() && mode !== 'instant') {
      takeScreenshotWindow.destroy();
      createScreenshotWindow(width, height, 'instant');
    }
    else if (!takeScreenshotWindow || takeScreenshotWindow.isDestroyed()) createScreenshotWindow(width, height, 'instant');
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

  if (takeScreenshotWindow.isDestroyed()) createScreenshotWindow(width, height);
  else takeScreenshotWindow.show();
});

app.on('window-all-closed', e => e.preventDefault());
