const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const { matarApp, aplicacionesCorriendo } = require('./AppsDefecto');

ipcMain.on('iniciar-app-spring-boot', async (event, {ruta, puerto}) => {  
  
  const comando = `cd ${ruta} && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=${puerto}`;
  

  if(!aplicacionesCorriendo.some(appYaCorriendo => appYaCorriendo.puerto == puerto)){
    const child = spawn(comando, {
      shell: true,
    });
    aplicacionesCorriendo.push({puerto: puerto, proceso: child});
    child.stdout.on('data', (data) => {
      // Enviar datos a Angular (a través de IPC o como prefieras)
      console.log(`stdout: ${data}`);
      event.sender.send(`iniciar-app-spring-boot-${puerto}`, data.toString());
    });
  
    child.stderr.on('data', (error) => {
      console.error(`stderr: ${error}`);
      event.sender.send(`iniciar-app-spring-boot-${puerto}`, error.toString());
    });
  }
});

ipcMain.handle('detener-app-spring-boot', async (event, puerto) => {
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