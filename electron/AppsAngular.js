const { ipcMain } = require('electron');
const { spawn } = require('child_process');
const { getAplicacionesCorriendo, agregarAplicacionCorriendo } = require('./AppsDefecto');

ipcMain.on('iniciar-app-angular', async (event, {ruta, puerto, abrir}) => {  
  
  const comando = `cd ${ruta} && ng serve ${abrir ? '-o':''} --port ${puerto}`;

  if(!getAplicacionesCorriendo().some(appYaCorriendo => appYaCorriendo.puerto == puerto)){
    const child = spawn(comando, {
      shell: true,
    });
    agregarAplicacionCorriendo({puerto: puerto, proceso: child});
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
  else {
    console.log("La aplicacion con puerto "+puerto+" ya está corriendo y no se puede agregar. Listado = ", getAplicacionesCorriendo());
  }
});