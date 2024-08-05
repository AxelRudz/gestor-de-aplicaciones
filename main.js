const { app, BrowserWindow, dialog, ipcMain, nativeTheme } = require("electron");
const path = require("path");

// Importo otros archivos de mi app
require("./electron/App.js");
require("./electron/Git.js");
require("./electron/PersistenciaApps.js");
const { inicializarModuloTareasAutomaticas } = require("./electron/tareas-automaticas/Git.js");
const { detenerTodasLasApps } = require("./electron/App.js");

app.setAppUserModelId("REPO MANAGER - Platinum Edition")

let win;

function createWindow () {

  win = new BrowserWindow({
    title: "REPO MANAGER - Platinum Edition",
    icon: path.join(__dirname, 'src', 'assets', 'logo-app.png'),
    width: 1200,
    height: 900,
    resizable: true,    
    webPreferences: {
      preload: path.join(__dirname, 'electron', 'preload.cjs'),
      contextIsolation: false,
      nodeIntegration: true,
    }
  })
  nativeTheme.themeSource = "dark";

  // win.webContents.openDevTools()

  // win.loadURL(`http://localhost:4000`); // <-- Usado para el hot reload
  win.loadURL(`file://${__dirname}/dist/repo-manager/index.html`); //<-- Todavia no estan seteados los ambientes, esto se usa en produccion

  win.setMenu(null);

  inicializarModuloTareasAutomaticas();

}

app.whenReady().then(() => {

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await detenerTodasLasApps();
    app.quit()
  }
})

ipcMain.handle('seleccionar-directorio', (event) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await dialog.showOpenDialog(win, {
        properties: ['openDirectory'],
      });
  
      if (result.canceled === false) {
        const filePath = result.filePaths[0];
        resolve(filePath)
      }
      else {
        resolve(null);
      }
    } catch (error) {
      console.error("Ocurrió un error al seleccionar el directorio. Error: ", error);
      resolve(null)
    }
  });
});
