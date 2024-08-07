const { ipcMain } = require('electron');
const util = require("util");
const { exec } = require('child_process');
const execPromise = util.promisify(exec);

ipcMain.handle('rama-actual', (event, ruta) => {
  return promesaRamaActual(ruta);
});

const promesaRamaActual = (ruta) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${ruta} && git branch --show-current`, (error, stdout, stderr) => {
      if(!error && !stderr && stdout){
        resolve(stdout.trim());
      }
      resolve("No disponible")
    })
  });
}

ipcMain.handle('ramas-disponibles', (event, ruta) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${ruta} && git remote show origin`, async (error, stdout, stderr) => {
      if(!stderr){
        const ramaPrincipal = stdout.split("\n").find(linea => linea.includes("HEAD branch: "));
        const nombreRamaPrincipal = ramaPrincipal.split("HEAD branch: ")[1];      
        const listadoDeRamas = await obtenerListadoDeRamasDisponibles(ruta, nombreRamaPrincipal)
        resolve(listadoDeRamas);
      }
      // Si no es un repositorio remoto
      else if(stderr.includes("does not appear to be a git repository")){
        const listadoDeRamasLocales = await obtenerListadoDeRamasDisponibles(ruta, null)
        resolve(listadoDeRamasLocales);
      }
      else {
        resolve([]);
      }
    })
  })
});

ipcMain.handle('rama-actualizada', (event, ruta) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${ruta} && git fetch && git status`, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve(true);
      }
      const lineasSalida = stdout.split('\n');
      const estaDesactualizada = lineasSalida.some(linea => linea.includes("behind"))
      resolve(!estaDesactualizada);
    });
  })
});

ipcMain.handle('git-pull', (event, ruta) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${ruta} && git pull`, async (error, stdout, stderr) => {
      if (error || stderr) {
        resolve({ok: false, mensajes: [`Error: ${stderr}`]});
      }
      const mensajes = stdout.split('\n').map(mensaje => mensaje.trim());
      resolve({ok: true, mensajes: mensajes});
    });
  })
});


ipcMain.handle('git-checkout', (event, ruta, rama) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${ruta} && git checkout ${rama}`, (error, stdout, stderr) => {
      if(error){        
        resolve({ok: false, mensajes: [error]});
      }
      const mensajes = stdout.split('\n').map(linea => linea.trim());
      resolve({ok: true, mensajes: mensajes})
    });
  })
});

function obtenerListadoDeRamasDisponibles(ruta, ramaPrincipal){
  // Si el repo tiene una rama principal, me traigo las ramas que no estan mergeadas a esa rama
  // Sino me traigo todas las ramas
  const comando = ramaPrincipal
    ? `cd ${ruta} && git branch --all --no-merged ${ramaPrincipal.trim()}`
    : `cd ${ruta} && git branch --all`

  return new Promise((resolve, reject) => {
    execPromise(comando, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve([])
      }
    
      // Proceso todas las lineas de la consola y las formateo
      // Resultado nombresRamas: string[]
      const lineasSalida = stdout.split('\n');
      const ramas = lineasSalida
        .map(linea => linea.trim())
        .map(linea => {
          const ArregloCaracteres = linea.split("");
          let nombreRama = "";
          ArregloCaracteres.forEach(caracter => {
            caracter != "*" && caracter != " "
              ? nombreRama += caracter
              : nombreRama += "";
          })
          if(!nombreRama.includes("HEAD->")){
            return nombreRama;
          }
          return "";          
        })
        .filter(nombre => nombre != "")
        .map(nombreRama => {
          if(nombreRama.includes("remotes/origin/")){
            return nombreRama.split("remotes/origin/")[1]
          }
          return nombreRama;
        })
      let ramasFiltradas = [];
      ramas.forEach(rama => {
        if(!ramasFiltradas.includes(rama)){
          ramasFiltradas.push(rama);
        }
      })
      resolve(ramasFiltradas);
    });  
  })
}