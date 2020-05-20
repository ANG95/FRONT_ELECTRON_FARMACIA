const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');

const isDev = require('electron-is-dev');
const url = require("url")
// From
const { Menu } = require('electron')
Menu.setApplicationMenu(false);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    show: false,
    titleBarStyle: 'hidden',
    frame: false, // esconde el titulo o header en  donde estan los botones para minimizar maximizar y cerrar
    backgroundColor: '#2e2c29',
    darkTheme: true,
    icon: path.join(__dirname, '../build/favicon.ico'),
    webPreferences: {
      nodeIntegration: true,
      // webSecurity: false,
      plugins: true,
      enableRemoteModule: true
    }
  });

  mainWindow.maximize();

  // Menu.setApplicationMenu(menu);
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  mainWindow.loadURL(
    isDev
      ?
      'http://localhost:3000'
      :
      startUrl
  );
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);
app.once('ready-to-show', () => {
  app.show();
  console.log("ready-to-show");
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    localStorage.removeItem('_userD');
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});


process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';