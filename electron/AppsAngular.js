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
      event.sender.send(`respuesta-inicio-app-angular-${puerto}`, data.toString());
    });
  
    child.stderr.on('data', (error) => {
      console.error(`stderr: ${error}`);
      event.sender.send(`respuesta-inicio-app-angular-${puerto}`, error.toString());
    });
  }
});

ipcMain.on('detener-app-angular', async (event, puerto) => {
  const appParaDetener = aplicacionesCorriendo.find(appYaCorriendo => appYaCorriendo.puerto == puerto)
  if(appParaDetener){
    matarApp(appParaDetener.proceso.pid)
    .then(ok => {
      if(ok){
        event.sender.send(`respuesta-detener-app-angular-${puerto}`, ok);
        aplicacionesCorriendo = aplicacionesCorriendo.filter(appCorriendo => appCorriendo != appParaDetener);
      }
    })    
  }
});

ipcMain.handle('eliminar-app', async (event, puerto) => {
  return new Promise((resolve, reject) => {
    const app = aplicacionesCorriendo.find(app => app.puerto == puerto);
    if(app){
      matarApp(app.proceso.pid)
      .then(ok => {
        resolve(ok);
      })
    }
    resolve(true);
  });
});

const matarAppsAngular = () => {
  aplicacionesCorriendo.forEach(app => {
    matarApp(app.proceso.pid)
    .then(ok => {
      if(ok){
        aplicacionesCorriendo = aplicacionesCorriendo.filter(appCorriendo => appCorriendo != appParaDetener);
      }
    })
  })
}

module.exports = {
  matarAppsAngular
}