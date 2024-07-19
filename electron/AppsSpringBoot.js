const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const { aplicacionesCorriendo } = require('./AppsDefecto');

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