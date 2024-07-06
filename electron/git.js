const { ipcMain } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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
    let branchName = "No disponible"
    if (!error) {
      branchName = stdout.trim();
    }
    event.sender.send(`respuesta-rama-git-${puerto}`, {ruta: rutaApp, nombre: branchName});
  });
}