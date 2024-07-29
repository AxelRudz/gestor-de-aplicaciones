const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

ipcMain.on('rama-actual', (event, ruta, puerto) => {
  // Devuelvo el nombre de la rama actual...y luego empiezo a escuchar cambios en el archivo
  const headFilePath = path.join(ruta, '.git', 'HEAD');
  sendRamaNombreGit(ruta, puerto, event);
  fs.watchFile(headFilePath, (curr, prev) => {
    // Al detectar un cambio en el archivo HEAD
    sendRamaNombreGit(ruta, puerto, event);
  });
});

function sendRamaNombreGit(ruta, puerto, event){
  exec('git branch --show-current', { cwd: ruta }, (error, stdout, stderr) => {
    let ramaActual = "No disponible"
    if (!error) {
      ramaActual = stdout.trim();
    }
    event.sender.send(`rama-actual-${puerto}`, ramaActual);
  });
}

ipcMain.handle('ramas-disponibles', (event, ruta) => {
  return new Promise((resolve, reject) => {
    exec(`cd ${ruta} && git branch --all`, (error, stdout, stderr) => {
      if (error || stderr) {
        reject([]);
      }
  
      // Procesar la salida de los comandos
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
    exec(`cd ${ruta} && git pull`, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve({ok: false, mensajes: ['Ocurrio un error al hacer git pull']});
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
      if(stderr){
        resolve({ok: false, mensajes: [stderr]});
      }
      const mensajes = stdout.split('\n').map(linea => linea.trim());
      resolve({ok: true, mensajes: mensajes})
    });
  })
});