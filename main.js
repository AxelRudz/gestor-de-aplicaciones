const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')

// Demas funciones de la app
const { matarAppsAngular } = require('./electron/AppsAngular');
require('./electron/AppsDefecto');
require('./electron/AppsAngular');
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
    matarAppsAngular();
    app.quit()
  }
})

ipcMain.on('abrir-ventana-seleccion-directorio', async (event) => {
  try {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    });

    if (result.canceled === false) {
      const filePath = result.filePaths[0];
      event.sender.send('ruta', filePath);
    }
  } catch (err) {
    console.error('Error opening dialog:', err);
  }
});