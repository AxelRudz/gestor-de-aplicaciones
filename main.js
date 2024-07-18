const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path');
const { matarTodasLasApps } = require('./electron/AppsDefecto');

// Demas funciones de la app
require('./electron/AppsDefecto');
require('./electron/AppsAngular');
require('./electron/AppsSpringBoot');
require('./electron/git');

require('electron-reload')(path.join(__dirname, 'dist'), {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});

let win;

function createWindow () {
  win = new BrowserWindow({
    title: "Gestor de aplicaciones",
    width: 800,
    height: 600,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'electron', 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  })

  win.loadURL(`http://localhost:4200`); //Sirve para el hot reload
  //win.loadURL(`file://${__dirname}/dist/gestor-de-aplicaciones/index.html`);

  win.webContents.openDevTools();

  win.setMenu(null);

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    matarTodasLasApps();
    app.quit()
  }
})

ipcMain.handle('seleccionar-directorio', async (event) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory'],
      });
  
      if (result.canceled === false) {
        const filePath = result.filePaths[0];
        resolve(filePath)
      }
    } catch (err) {
      resolve(null)
    }
  });
});