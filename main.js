const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path');
const { matarTodasLasApps } = require('./electron/AppsDefecto');
const fs = require('fs');

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

ipcMain.handle('recuperar-aplicaciones-guardadas', async (event) => {
  return new Promise(async (resolve, reject) => {
    const path = app.getPath('userData');
    console.log("PATHHHHHHHHHHHHHH: ", path);
    try {
      const buf = await fs.promises.readFile(`${path}/ListadoAplicacionesGuardadas`, 'utf-8');
      const apps = buf.split('\n').filter(linea => linea);
      console.log("Devuelvo las apps: ", apps);
      resolve(apps)
    }
    catch(error){
      reject(null);
    }
  });
});

ipcMain.handle('persistencia-agregar-aplicacion', async (event, linea) => {
  return new Promise(async (resolve, reject) => {
    const path = app.getPath('userData');
    const filePath = `${path}/ListadoAplicacionesGuardadas`;
    try {
      // Leer el archivo para asegurarse de que existe
      await fs.promises.readFile(filePath, 'utf-8');
      // Agregar la nueva línea al final del archivo
      await fs.promises.appendFile(filePath, `\n${linea}`);
      resolve(true)
    }
    catch(error){
      // Si el archivo no existe, crearlo y agregar la línea
      if (error.code === 'ENOENT') {
        try {
          await fs.promises.writeFile(filePath, linea);
          resolve(true);
        } catch (writeError) {
          reject(writeError);
        }
      } else {
        reject(error);
      }
    }
  });
});

ipcMain.handle('persistencia-eliminar-aplicacion', async (event, puerto) => {
  return new Promise(async (resolve, reject) => {
    const path = app.getPath('userData');
    const filePath = `${path}/ListadoAplicacionesGuardadas`;
    try {
      // Leer el archivo para obtener todas las líneas. Elimino las lineas en blanco
      const data = await fs.promises.readFile(filePath, 'utf-8');
      const lineasArchivo = data.split('\n').filter(linea => linea);

      // Filtrar las líneas para eliminar la que contiene el puerto
      const lineasFiltradas = lineasArchivo.filter(linea => linea.split("|||")[2] != puerto);

      // Sobrescribir el archivo con las líneas restantes
      await fs.promises.writeFile(filePath, lineasFiltradas.join('\n'));

      resolve(true);
    } catch (error) {
      // Si el archivo no existe, resolver con true porque no hay nada que borrar
      if (error.code === 'ENOENT') {
        resolve(true);
      } else {
        reject(error);
      }
    }
  });
});



