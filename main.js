const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const path = require('path')
const { exec, spawn } = require('child_process');

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

  win.loadURL(`http://localhost:4200`);

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

ipcMain.on('obtener-rama-git', async (event, ruta) => {
  const command = `git -C "${ruta}" rev-parse --abbrev-ref HEAD`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      event.sender.send('respuesta-rama-git', {ruta: ruta, nombre: "No identificada"});
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      event.sender.send('respuesta-rama-git', {ruta: ruta, nombre: "No identificada"});
      return;
    }
    const nombreRama = stdout.trim();
    event.sender.send('respuesta-rama-git', {ruta: ruta, nombre: nombreRama});
  });
});

ipcMain.on('iniciar-app-angular', async (event, {nombreApp, ruta, puerto}) => {
  
  const comando = `cd ${ruta} && ng serve --port ${puerto}`;

  const child = spawn(comando, {
    shell: true,
  });

  child.stdout.on('data', (data) => {
    // Enviar datos a Angular (a través de IPC o como prefieras)
    console.log(`stdout: ${data}`);
    event.sender.send(`respuesta-inicio-app-angular-${nombreApp}`, data.toString());
  });

  child.stderr.on('data', (error) => {
    console.error(`stderr: ${error}`);
    event.sender.send(`respuesta-inicio-app-angular-${nombreApp}`, error.toString());
  });

  child.on('close', (code) => {
    console.log(`Proceso hijo terminado con código ${code}`);
    event.sender.send(`respuesta-inicio-app-angular-${nombreApp}`, "");
  });

});