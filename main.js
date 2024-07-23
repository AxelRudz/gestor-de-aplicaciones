import { app, BrowserWindow, dialog, ipcMain, nativeTheme } from "electron";
import path from "path";

// Importo los otros archivos de mi app
import { gestorDeApps } from"./electron/GestorDeApps.js"
import { inicializarModuloAppsAngular } from "./electron/AppsAngular.js";
import { inicializarModuloAppsDefecto } from "./electron/AppsDefecto.js"
import { inicializarModuloAppsSpringBoot } from "./electron/AppsSpringBoot.js";
import { inicializarModuloGit } from "./electron/git.js";
import { inicializarModuloPersistenciaApps } from "./electron/PersistenciaApps.js";
import { inicializarModuloTareasAutomaticas } from "./electron/tareas-automaticas/Git.js";

export const __dirname = import.meta.dirname;


inicializarModuloAppsAngular();
inicializarModuloAppsDefecto();
inicializarModuloAppsSpringBoot();
inicializarModuloGit();
inicializarModuloPersistenciaApps();
inicializarModuloTareasAutomaticas();

let win;

function createWindow () {

  win = new BrowserWindow({
    title: "Gestor de aplicaciones",
    icon: path.resolve(__dirname, "src", "assets", "icono3.ico"),
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

  win.loadURL(`http://localhost:4000`); // <-- Usado para el hot reload
  //win.webContents.openDevTools()
  
  //win.loadURL(`file://${__dirname}/dist/gestor-de-aplicaciones/index.html`); <-- Todavia no estan seteados los ambientes, esto se usa en produccion

  win.setMenu(null);

}

app.whenReady().then(() => {
  if (process.platform == 'win32') {
    app.setAppUserModelId('Gestor de aplicaciones');
  }

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
