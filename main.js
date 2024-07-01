const { app, BrowserWindow, dialog, ipcMain } = require('electron/main')
const path = require('path')

let win;

function createWindow () {
  win = new BrowserWindow({
    title: "Gestor de aplicaciones",
    width: 1200,
    height: 800,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  })

  win.loadURL(`file://${__dirname}/dist/gestor-de-aplicaciones/index.html`);

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
    app.quit()
  }
})

ipcMain.on('abrir-ventana-seleccionar-archivo', async (event) => {
  try {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openFile'],
      filters: [{ name: 'All Files', extensions: ['*'] }]
    });

    if (result.canceled === false) {
      const filePath = result.filePaths[0];
      event.sender.send('ruta', filePath);
    }
  } catch (err) {
    console.error('Error opening dialog:', err);
  }
});