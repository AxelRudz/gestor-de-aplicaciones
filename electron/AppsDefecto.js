const { ipcMain } = require('electron');
const { gestorDeApps } = require('./GestorDeApps');

ipcMain.handle('detener-app', async (event, puerto) => {
  return gestorDeApps.detenerAplicacion(puerto);
});
