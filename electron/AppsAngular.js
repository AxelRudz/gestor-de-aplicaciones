import { ipcMain } from 'electron';
import { gestorDeApps } from './GestorDeApps.js';

export function inicializarModuloAppsAngular(){

  ipcMain.on('iniciar-app-angular', async (event, {ruta, puerto, abrir}) => {  
    const comando = `cd ${ruta} && ng serve ${abrir ? '-o':''} --port ${puerto}`;
    const canalRespuesta = `respuesta-iniciar-app-angular-${puerto}`;
    gestorDeApps.iniciarAplicacion(event, puerto, comando, canalRespuesta);
  });

}