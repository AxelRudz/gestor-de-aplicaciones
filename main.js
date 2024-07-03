const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const { exec, spawn } = require('child_process');
const fs = require('fs');


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
      preload: path.join(__dirname, 'preload.js'),
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

ipcMain.on('obtener-rama-git', async (event, {puerto, ruta}) => {
  
  // Devuelvo el nombre de la rama actual...y luego empiezo a escuchar cambios en el archivo
  const headFilePath = path.join(ruta, '.git', 'HEAD');
  obtenerNombreRamaActual(ruta, puerto, event);
  fs.watchFile(headFilePath, (curr, prev) => {
    // Al detectar un cambio en el archivo HEAD
    obtenerNombreRamaActual(ruta, puerto, event);
  });
});

function obtenerNombreRamaActual(rutaApp, puerto, event){
  exec('git branch --show-current', { cwd: rutaApp }, (error, stdout, stderr) => {
    let branchName = "No disponible"
    if (!error) {
      branchName = stdout.trim();
    }
    event.sender.send(`respuesta-rama-git-${puerto}`, {ruta: rutaApp, nombre: branchName});
  });
}
  
ipcMain.on('iniciar-app-angular', async (event, {ruta, puerto}) => {
  
  const comando = `cd ${ruta} && ng serve --port ${puerto}`;

  const child = spawn(comando, {
    shell: true,
  });

  child.stdout.on('data', (data) => {
    // Enviar datos a Angular (a través de IPC o como prefieras)
    console.log(`stdout: ${data}`);
    event.sender.send(`respuesta-inicio-app-angular-${puerto}`, data.toString());
  });

  child.stderr.on('data', (error) => {
    console.error(`stderr: ${error}`);
    event.sender.send(`respuesta-inicio-app-angular-${puerto}`, error.toString());
  });

  child.on('close', (code) => {
    console.log(`Proceso hijo terminado con código ${code}`);
    event.sender.send(`respuesta-inicio-app-angular-${puerto}`, "");
  });

});


ipcMain.on('obtener-estado-puerto', async (event, puerto) => {
  const isPortActive = await checkPort(puerto);
  event.sender.send(`respuesta-estado-puerto-${puerto}`, isPortActive);
});

function checkPort(port) {
  return new Promise((resolve, reject) => {
    exec(`netstat -an | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        if (error.code === 1) {
          // Código 1 significa que no se encontraron coincidencias
          resolve(false);
        } else {
          reject(error);
        }
      } else {
        // Si hay alguna salida, el puerto está en uso
        resolve(stdout.includes(`:${port}`));
      }
    });
  });
}