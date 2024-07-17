const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const { matarApp } = require('./AppsDefecto');

// {puerto, proceso}[]
let aplicacionesCorriendo = [];

ipcMain.on('iniciar-app-angular', async (event, {ruta, puerto, abrir}) => {  
  
  const comando = `cd ${ruta} && ng serve ${abrir ? '-o':''} --port ${puerto}`;

  if(!aplicacionesCorriendo.some(appYaCorriendo => appYaCorriendo.puerto == puerto)){
    const child = spawn(comando, {
      shell: true,
    });
    aplicacionesCorriendo.push({puerto: puerto, proceso: child});
    child.stdout.on('data', (data) => {
      // Enviar datos a Angular (a través de IPC o como prefieras)
      console.log(`stdout: ${data}`);
      event.sender.send(`iniciar-app-angular-${puerto}`, data.toString());
    });
  
    child.stderr.on('data', (error) => {
      console.error(`stderr: ${error}`);
      event.sender.send(`iniciar-app-angular-${puerto}`, error.toString());
    });
  }
});

ipcMain.handle('detener-app-angular', async (event, puerto) => {
  return new Promise((resolve, reject) => {
    const app = aplicacionesCorriendo.find(app => app.puerto == puerto);
    if(app){
      matarApp(app.proceso.pid)
      .then(ok => {
        aplicacionesCorriendo = aplicacionesCorriendo.filter(aplicacionCorriendo => aplicacionCorriendo != app);
        resolve(ok);
      })
    }
    resolve(true);
  });
});

const matarTodasLasAppsAngular = () => {
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
  matarTodasLasAppsAngular
}