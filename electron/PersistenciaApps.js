const { app, ipcMain } = require('electron');
const fs = require("fs");

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

const recuperarAppsGuardadas = () => {
  return new Promise((resolve, reject) => {
    const path = app.getPath('userData');
    try {
      const buf = fs.readFileSync(`${path}/ListadoAplicacionesGuardadas`, 'utf-8');
      const apps = buf.split('\n').filter(linea => linea);
      resolve(apps)
    }
    catch(error){
      // Si el error es porque no existe ese archivo, lo creo
      if(error.code = 'ENOENT'){
        try {
          // Abro y cierro el archivo para crearlo
          fs.closeSync(fs.openSync(`${path}/ListadoAplicacionesGuardadas`, "w"));
          resolve([]);
        } catch (writeError) {
          reject(writeError);
        }
      }
      reject(error.message);
    }
  });
}

module.exports = {
  recuperarAppsGuardadas
}