const { app, ipcMain } = require('electron');
const fs = require("fs");
const { matarProceso } = require('./App')


let cacheAplicacionesGuardadas = [];

ipcMain.handle('persistencia-recuperar-aplicaciones-guardadas', (event) => {
  return getAplicacionesGuardadas();
});

// Formato (event: any, aplicacion: Aplicacion)
ipcMain.handle('persistencia-agregar-aplicacion', (event, aplicacion) => {
  return new Promise((resolve, reject) => {
    try {
      const aplicacionesGuardadas = getCacheAplicacionesGuardadas();      
      aplicacionesGuardadas.push(aplicacion);
      setAplicacionesGuardadas(aplicacionesGuardadas)
      resolve(true);
    }
    catch(error){
      reject(error);
    }
  });
});

ipcMain.handle('persistencia-eliminar-aplicacion', async (event, puerto, pid) => {
  return new Promise(async (resolve, reject) => {
    if(pid){
      await matarProceso(pid)
      .catch(error => {
        console.error("Error deteniendo la aplicación. Error: ", error);
        reject("Error deteniendo la aplicación.")
      });
    }
    try {
      const listadoAplicaciones = getCacheAplicacionesGuardadas();
      const indexApp = listadoAplicaciones.findIndex(aplicacion => aplicacion.puerto == puerto);
      if(indexApp != -1){        
        listadoAplicaciones.splice(indexApp, 1);
      }
      setAplicacionesGuardadas(listadoAplicaciones);
      resolve(true)
    }
    catch(error){
      console.error("Ocurrió un error obteniendo el listado de aplicaciones guardadas. Error: ", error);
      resolve(false)
    }
  });
});

const getAplicacionesGuardadas = () => {
  const path = app.getPath('userData');
  const filePath = `${path}/ListadoAplicacionesGuardadas`;
  try {
    if(!fs.existsSync(filePath)){
      fs.writeFileSync(filePath, "[]" ,"utf-8");
    }
    const listadoAplicacionesGuardadas = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    cacheAplicacionesGuardadas = listadoAplicacionesGuardadas;
    return listadoAplicacionesGuardadas;
  }
  catch(error){
    console.error("Ocurrió un error obteniendo el listado de aplicaciones guardadas. Error: ", error);
    throw error;
  }
}

const setAplicacionesGuardadas = (listado) => {
  const path = app.getPath('userData');
  const filePath = `${path}/ListadoAplicacionesGuardadas`;
  try {
    fs.writeFileSync(filePath, JSON.stringify(listado, null, 4), 'utf-8');
    cacheAplicacionesGuardadas = listado;
  }
  catch(error){
    console.error("Ocurrió un error escribiendo el archivo de aplicaciones guardadas. Error: ", error);
    throw error;
  }
}

const getCacheAplicacionesGuardadas = () => {
  return cacheAplicacionesGuardadas
}

module.exports = {
  getCacheAplicacionesGuardadas
}