import { app, ipcMain } from 'electron';
import fs from "fs";

export function inicializarModuloPersistenciaApps(){

  ipcMain.handle('recuperar-aplicaciones-guardadas', async (event) => {
    return recuperarAppsGuardadas();
  });

  ipcMain.handle('persistencia-agregar-aplicacion', async (event, linea) => {
    return new Promise(async (resolve, reject) => {
      const path = app.getPath('userData');
      const filePath = `${path}/ListadoAplicacionesGuardadas`;
      try {
        // Leer el archivo para asegurarse de que existe
        await fs.promises.readFile(filePath, 'utf-8');
        // Agregar la nueva línea al final del archivo
        await fs.promises.appendFile(filePath, `\n${linea}`);
        resolve(true)
      }
      catch(error){
        // Si el archivo no existe, crearlo y agregar la línea
        if (error.code === 'ENOENT') {
          try {
            await fs.promises.writeFile(filePath, linea);
            resolve(true);
          } catch (writeError) {
            reject(writeError);
          }
        } else {
          reject(error);
        }
      }
    });
  });

  ipcMain.handle('persistencia-eliminar-aplicacion', async (event, puerto) => {
    return new Promise(async (resolve, reject) => {
      const path = app.getPath('userData');
      const filePath = `${path}/ListadoAplicacionesGuardadas`;
      try {
        // Leer el archivo para obtener todas las líneas. Elimino las lineas en blanco
        const data = await fs.promises.readFile(filePath, 'utf-8');
        const lineasArchivo = data.split('\n').filter(linea => linea);

        // Filtrar las líneas para eliminar la que contiene el puerto
        const lineasFiltradas = lineasArchivo.filter(linea => linea.split("|||")[2] != puerto);

        // Sobrescribir el archivo con las líneas restantes
        await fs.promises.writeFile(filePath, lineasFiltradas.join('\n'));

        resolve(true);
      } catch (error) {
        // Si el archivo no existe, resolver con true porque no hay nada que borrar
        if (error.code === 'ENOENT') {
          resolve(true);
        } else {
          reject(error);
        }
      }
    });
  });
}

export const recuperarAppsGuardadas = () => {
  return new Promise(async (resolve, reject) => {
    const path = app.getPath('userData');
    try {
      const buf = await fs.promises.readFile(`${path}/ListadoAplicacionesGuardadas`, 'utf-8');
      const apps = buf.split('\n').filter(linea => linea);
      resolve(apps)
    }
    catch(error){
      reject(null);
    }
  });
}