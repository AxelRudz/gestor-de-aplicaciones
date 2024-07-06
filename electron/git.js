const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const { rejects } = require('assert');

ipcMain.on('obtener-rama-git', async (event, {puerto, ruta}) => {
  
  // Devuelvo el nombre de la rama actual...y luego empiezo a escuchar cambios en el archivo
  const headFilePath = path.join(ruta, '.git', 'HEAD');
  devolverNombreRamaGit(ruta, puerto, event);
  fs.watchFile(headFilePath, (curr, prev) => {
    // Al detectar un cambio en el archivo HEAD
    devolverNombreRamaGit(ruta, puerto, event);
  });
});

function devolverNombreRamaGit(rutaApp, puerto, event){
  exec('git branch --show-current', { cwd: rutaApp }, (error, stdout, stderr) => {
    let branchName = null
    if (!error) {
      branchName = stdout.trim();
    }
    event.sender.send(`respuesta-rama-git-${puerto}`, {ruta: rutaApp, nombre: branchName});
  });
}

ipcMain.handle('obtener-info-ramas-git', async (event, body) => {
  const rutaRepo = body[0].rutaRepo;
  const puerto = body[0].puerto;
  return new Promise((resolve, reject) => {
    exec(`cd ${rutaRepo} && git fetch && git branch -r && git status -uno`, (error, stdout, stderr) => {
      if (error || stderr) {
        resolve(null);
      }
  
      // Procesar la salida de los comandos
      const lineasSalida = stdout.split('\n');
      const ramas = lineasSalida.filter(linea => linea.startsWith('  origin/')).map(linea => linea.trim());
      const tieneCambios = lineasSalida.some(line => line.includes('Your branch is behind'));
  
      const response = {
        ramas,
        tieneCambios
      };
      console.log(`Envio a respuesta-obtener-info-ramas-git-${puerto}`, response);
      resolve(response);
    });
  })
});


ipcMain.handle('cambiar-de-rama', async (event, body) => {
  const rutaRepo = body[0].rutaRepo;
  const rama = body[0].rama;
  return new Promise((resolve, reject) => {
    exec(`cd ${rutaRepo} && git checkout ${rama}`, (error, stdout, stderr) => {
      resolve(!(error || stderr));
    });
  })
});