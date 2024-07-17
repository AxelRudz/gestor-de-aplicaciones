const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

ipcMain.on('observar-rama-git', async (event, {puerto, ruta}) => {
  
  // Devuelvo el nombre de la rama actual...y luego empiezo a escuchar cambios en el archivo
  const headFilePath = path.join(ruta, '.git', 'HEAD');
  sendRamaNombreGit(ruta, puerto, event);
  fs.watchFile(headFilePath, (curr, prev) => {
    // Al detectar un cambio en el archivo HEAD
    sendRamaNombreGit(ruta, puerto, event);
  });
});

function sendRamaNombreGit(rutaApp, puerto, event){
  exec('git branch --show-current', { cwd: rutaApp }, (error, stdout, stderr) => {
    let branchName = "No disponible"
    if (!error) {
      branchName = stdout.trim();
    }
    event.sender.send(`respuesta-observar-rama-git-${puerto}`, {ruta: rutaApp, nombre: branchName});
  });
}

ipcMain.handle('obtener-info-ramas-git', async (event, body) => {
  const rutaRepo = body[0].rutaRepo;
  const puerto = body[0].puerto;
  return new Promise((resolve, reject) => {
    exec(`cd ${rutaRepo} && git fetch && git branch --all`, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve(null);
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
      const tieneCambios = lineasSalida.some(line => line.includes('Your branch is behind'));
  
      const response = {
        ramas: ramasFiltradas,
        tieneCambios
      };
      resolve(response);
    });
  })
});


ipcMain.handle('git-checkout', async (event, body) => {
  const rutaRepo = body[0].rutaRepo;
  const rama = body[0].rama;
  return new Promise((resolve, reject) => {
    exec(`cd ${rutaRepo} && git checkout ${rama}`, (error, stdout, stderr) => {
      resolve(!(error || stderr));
    });
  })
});