ipcMain.on('obtener-estado-puerto', async (event, puerto) => {
  const isPortActive = await checkPort(puerto);
  event.sender.send(`respuesta-estado-puerto-${puerto}`, isPortActive);
});

function checkPort(port){
  return new Promise((resolve, reject) => {
    exec(`netstat -an | findstr :${port}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        // Si hay alguna salida, el puerto está en uso
        resolve(stdout.includes(`:${port}`));
      }
    });
  });
}
