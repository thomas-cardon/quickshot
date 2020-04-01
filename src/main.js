// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut, Menu, Tray } = require('electron');
const path = require('path');

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock)
  return app.quit();

const { FileStorage } = require('a-capsule');
let Storage = new FileStorage('settings.json');

/* Command line parameters */
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.allowRendererProcessReuse = true;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let takeScreenshotWindow, mode, settingsWindow;
const dev = process.argv.includes('--dev');

const { autoUpdater } = require('electron-updater');

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
    kiosk: true,
    x: 0,
    y: 0,
    thickFrame: false,
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      experimentalFeatures: true,
      allowRunningInsecureContent: true
    }
  });

  takeScreenshotWindow.loadFile(path.join(__dirname, '/views/', 'ui-' + mode + '.html'));
  takeScreenshotWindow.webContents.executeJavaScript("global.Store = " + JSON.stringify(Storage._store) + "; global.UIEnabled = " + (page === 'photo' ? 'true;' : 'false;'));

  takeScreenshotWindow.once('ready-to-show', () => {
    console.log('>> Capturing source');
    takeScreenshotWindow.webContents.executeJavaScript("take();", true);
    takeScreenshotWindow.show();
  });

  takeScreenshotWindow.on('show', () => {
    console.log('>> Screenshot window is now shown.');
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

let F = {};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  tray = new Tray(path.join(__dirname, '../build/icon.ico'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Capture d\'écran', click: () => F.photo() },
    { label: 'Instantané', click: () => F.instant() },
    { type: 'separator' },
    { label: 'Paramètres', click: () => F.settings() },
    { label: 'Quitter', click: app.quit }
  ]);

  tray.setToolTip('Quickshot - Screenshot Tool');
  tray.setContextMenu(contextMenu);

  Storage.load().then(async () => {
    await Storage.default()
    .add('shortcut-photo', 'PrintScreen')
    .add('shortcut-instant', 'Shift+PrintScreen')
    .add('shortcut-settings', 'CommandOrControl+PrintScreen')
    .add('photo-extension', 'png')
    .add('photo-compression', 2)
    .end();

    console.log('>> Ready, Electron:', process.versions.electron);

    globalShortcut.register(Storage.get('shortcut-photo'), F.photo = () => {
      const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

      console.log('>> PrintScreen key pressed!');
      if (takeScreenshotWindow && !takeScreenshotWindow.isDestroyed() && mode !== 'photo') {
        takeScreenshotWindow.destroy();
        createScreenshotWindow(width, height, 'photo');
      }
      else if (!takeScreenshotWindow || takeScreenshotWindow.isDestroyed()) createScreenshotWindow(width, height, 'photo');
      else {
        takeScreenshotWindow.webContents.executeJavaScript("take();", true);
        takeScreenshotWindow.show();
      }
    });

    globalShortcut.register(Storage.get('shortcut-instant'), F.instant = () => {
      const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

      console.log('>> Shift+PrintScreen key pressed!');
      if (takeScreenshotWindow && !takeScreenshotWindow.isDestroyed() && mode !== 'instant') {
        takeScreenshotWindow.destroy();
        createScreenshotWindow(width, height, 'instant');
      }
      else if (!takeScreenshotWindow || takeScreenshotWindow.isDestroyed()) createScreenshotWindow(width, height, 'instant');
      else {
        takeScreenshotWindow.webContents.executeJavaScript("take();", true);
        takeScreenshotWindow.show();
      }
    });

    globalShortcut.register(Storage.get('shortcut-settings'), F.settings = () => {
      console.log('>> Settings key pressed!');
      if (!settingsWindow) createSettingsWindow();
      else settingsWindow.show();
    });
  });
});

app.on('activate', function () {
  const { width, height } = require('electron').screen.getPrimaryDisplay().workAreaSize;

  if (takeScreenshotWindow.isDestroyed()) createScreenshotWindow(width, height);
  else takeScreenshotWindow.show();
});

app.on('window-all-closed', e => e.preventDefault());
