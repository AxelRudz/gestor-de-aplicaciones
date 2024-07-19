const { ipcMain } = require('electron')
const { exec } = require('child_process');
var treeKill = require('tree-kill');

// {puerto, proceso}[]
let aplicacionesCorriendo = [];

ipcMain.on('obtener-estado-puerto', async (event, puerto) => {
  const isPortActive = await checkPort(puerto);
  event.sender.send(`respuesta-estado-puerto-${puerto}`, isPortActive);
});

ipcMain.handle('detener-app', async (event, puerto) => {
  return new Promise((resolve, reject) => {
    const app = aplicacionesCorriendo.find(app => app.puerto == puerto);
    if(app){
      matarApp(app)
      .then(ok => {
        resolve(ok);
      })
    }
    resolve(true);
  });
});

function checkPort(port){
  return new Promise((resolve, reject) => {
    exec(`netstat -an | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        // Si hay alguna salida, el puerto está en uso
        resolve(stdout.includes(`:${port}`));
      }
    });
  });
}

const matarApp = (app) => {
  return new Promise((resolve, reject) => {
    treeKill(app.proceso.pid, 'SIGTERM', (err) => {
      if(!err){
        aplicacionesCorriendo = aplicacionesCorriendo.filter(appCorriendo => appCorriendo != app);
      }
      resolve(!err);
    });
  });
}

const matarTodasLasApps = () => {
  aplicacionesCorriendo.forEach(app => {
    matarApp(app)
  })
}

module.exports = {
  checkPort,
  matarApp,
  matarTodasLasApps,
  aplicacionesCorriendo
}