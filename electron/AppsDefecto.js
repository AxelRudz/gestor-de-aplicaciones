const { ipcMain } = require('electron')
const { exec } = require('child_process');
var treeKill = require('tree-kill');

// {puerto, proceso}[]
let aplicacionesCorriendo = [];

ipcMain.on('obtener-estado-puerto', async (event, puerto) => {
  const isPortActive = await checkPort(puerto);
  event.sender.send(`respuesta-estado-puerto-${puerto}`, isPortActive);
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

function matarApp(pid){
  return new Promise((resolve, reject) => {
    treeKill(pid, 'SIGTERM', (err) => {
      resolve(!err);
    });
  });
}

const matarTodasLasApps = () => {
  aplicacionesCorriendo.forEach(app => {
    matarApp(app.proceso.pid)
    .then(ok => {
      if(ok){
        aplicacionesCorriendo = aplicacionesCorriendo.filter(appCorriendo => appCorriendo != app);
      }
    })
  })
}

module.exports = {
  checkPort,
  matarApp,
  matarTodasLasApps,
  aplicacionesCorriendo
}