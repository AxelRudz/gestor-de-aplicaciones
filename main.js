import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from "electron";
import path from "path";

// Importo los otros archivos de mi app
import { gestorDeApps } from"./electron/GestorDeApps.js"
import { inicializarModuloAppsAngular } from "./electron/AppsAngular.js";
import { inicializarModuloAppsDefecto } from "./electron/AppsDefecto.js"
import { inicializarModuloAppsSpringBoot } from "./electron/AppsSpringBoot.js";
import { inicializarModuloGit } from "./electron/git.js";
import { inicializarModuloPersistenciaApps } from "./electron/PersistenciaApps.js";

inicializarModuloAppsAngular();
inicializarModuloAppsDefecto();
inicializarModuloAppsSpringBoot();
inicializarModuloGit();
inicializarModuloPersistenciaApps();

let win;
const __dirname = import.meta.dirname;

function createWindow () {

  win = new BrowserWindow({
    title: "Gestor de aplicaciones",
    icon: "./src/assets/logo-angular.png",
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

  win.loadURL(`http://localhost:4000`); //Sirve para el hot reload
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
