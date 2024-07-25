const { app, BrowserWindow, dialog, ipcMain, nativeTheme } = require("electron");
const path = require("path");

// Importo otros archivos de mi app
require("./electron/AppsAngular.js");
require("./electron/AppsDefecto.js");
require("./electron/AppsSpringBoot.js");
require("./electron/git.js");
require("./electron/PersistenciaApps.js");
const { gestorDeApps } = require("./electron/GestorDeApps.js");
const { inicializarModuloTareasAutomaticas } = require("./electron/tareas-automaticas/Git.js");

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

  //win.webContents.openDevTools()

  win.loadURL(`http://localhost:4000`); // <-- Usado para el hot reload
  //win.loadURL(`file://${__dirname}/dist/repo-manager/index.html`); //<-- Todavia no estan seteados los ambientes, esto se usa en produccion

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
    await gestorDeApps.detenerTodasLasApps();
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
