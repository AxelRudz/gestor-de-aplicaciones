const { ipcMain } = require('electron');
const { gestorDeApps } = require('./GestorDeApps');

ipcMain.on('iniciar-app-angular', async (event, {ruta, puerto, abrir}) => {  
  
  const comando = `cd ${ruta} && ng serve ${abrir ? '-o':''} --port ${puerto}`;
  const canalRespuesta = `respuesta-iniciar-app-angular-${puerto}`;

  gestorDeApps.iniciarAplicacion(event, puerto, comando, canalRespuesta);

});