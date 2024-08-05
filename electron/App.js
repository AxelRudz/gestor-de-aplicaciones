const { ipcMain, shell } = require('electron');
const treeKill = require("tree-kill");
const { exec, spawn } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
var Convert = require('ansi-to-html');
var convert = new Convert();

const pidsAplicacionesCorriendo = [];

ipcMain.on('iniciar-aplicacion', (event, idApp, ruta, comando) => {
  // Creo el proceso
  const proceso = spawn(comando, {
    shell: true,
    cwd: ruta
  });
  let pid = null;
  if(proceso.pid){
    pid = proceso.pid
    pidsAplicacionesCorriendo.push(proceso.pid);
  }
  // Voy devolviendo los resultados por el canal de respuesta
  proceso.stdout.on('data', (data) => {
    if(data){
      console.log(`stdout: ${data}`);
      const mensaje = data ? convert.toHtml(data.toString()) : data.toString()
      event.sender.send(`iniciar-aplicacion-${idApp}`, pid, mensaje);
    }
  });

  proceso.stderr.on('data', (error) => {
    if(error){
      console.error(`stderr: ${error}`);
      const mensaje = convert.toHtml(error.toString())
      event.sender.send(`iniciar-aplicacion-${idApp}`, pid, mensaje);
    }
  });
});


ipcMain.handle('detener-aplicacion', (event, pid) => {
  return new Promise(async (resolve, reject) =>{
    const indexAppCorriendo = pidsAplicacionesCorriendo.findIndex(pidCorriendo => pidCorriendo == pid);
    if(indexAppCorriendo == -1){
      resolve(true);
    }
    try {
      const ok = await matarProceso(pid);
      if(ok){
        pidsAplicacionesCorriendo.splice(indexAppCorriendo, 1);
      }
      resolve(ok);
    } catch (error) {
      return reject(`Hubo un error al matar el proceso con pid ${pid}. Error: ${error}`);
    }
  });
});

const matarProceso = (pid) => {
  return new Promise((resolve, reject) =>{
    treeKill(pid,'SIGTERM',(err) => {
      // Si hubo un error porque no encontró el pid, lo tomo como que se borró correctamente.
      if(err && err.code == 128){
        resolve(true)
      }
      resolve(!err)
    });
  });
}

const detenerTodasLasApps = () => {
  return Promise.allSettled(
    [...pidsAplicacionesCorriendo].map((pid, indexProceso) => {
      return matarProceso(pid)
      .then(ok => {
        if(ok){
          pidsAplicacionesCorriendo.splice(indexProceso, 1)
        }
      })
      .catch(error => console.error(`Hubo un error al matar el proceso con pid ${pid}. Error: ${error}`));
    })
  )
}

ipcMain.handle('abrir-aplicacion-en-visual-studio', (event, ruta) => {
  return new Promise((resolve, reject) => {
    execPromise(`code -n ${ruta}`)
      .then(({ stdout, stderr }) => {
        resolve(!stderr)
      })
      .catch(error => {
        reject(error)
      });
  })
});

ipcMain.handle('abrir-en-navegador', (event, puerto) => {
  return new Promise((resolve, reject) => {
    shell.openExternal(`http://localhost:${puerto}`)
    .then( _ => {
      resolve(true);
    })
    .catch(error => {
      reject(error);
    })
  })
});

ipcMain.handle('abrir-tablero-de-trello', (event, url) => {
  return new Promise((resolve, reject) => {
    shell.openExternal(`${url}`)
    .then( _ => {
      resolve(true);
    })
    .catch(error => {
      reject(error);
    })
  })
});




module.exports = {
  matarProceso,
  detenerTodasLasApps
}