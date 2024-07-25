const { ipcMain } = require('electron');
const { gestorDeApps } = require('./GestorDeApps.js');

ipcMain.handle('detener-app', async (event, puerto) => {
  return gestorDeApps.detenerAplicacion(puerto);
});