import { ipcMain } from 'electron';
import { gestorDeApps } from './GestorDeApps.js';

export function inicializarModuloAppsDefecto(){

  ipcMain.handle('detener-app', async (event, puerto) => {
    return gestorDeApps.detenerAplicacion(puerto);
  });

}
