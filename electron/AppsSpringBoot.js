import { ipcMain } from 'electron';
import { gestorDeApps } from './GestorDeApps.js';

export function inicializarModuloAppsSpringBoot(){

  ipcMain.on('iniciar-app-spring-boot', async (event, {ruta, puerto, abrir}) => {  
    const comando = `cd ${ruta} && mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=${puerto}`;
    const canalRespuesta = `respuesta-iniciar-app-spring-boot-${puerto}`;
    gestorDeApps.iniciarAplicacion(event, puerto, comando, canalRespuesta);
  });

}