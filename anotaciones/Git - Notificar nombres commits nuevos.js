// git log origin/master --since="yesterday"  --pretty=format:"Hash: %H | Autor: %an | Commit: %s"

// Me sirve para obtener la lista de commits desde ayer en X rama.
// Podria tener un archivo de control con todos los commits remotos al iniciar el dia de hoy.
// Voy consultando cada cierto tiempo y si la consulta tiene mas commits que mi archivo de control,
// agrego esos commits a mi archivo y muestro la informacion de los mismos en una notificacion

// Abajo hay codigo de como uso comandos git, notificaciones, etc...

exec(`cd ${__dirname} && git show --pretty=format:"%H---%an---%s" --no-patch`, (error, stdout, stderr) => {
    
  const hashCommit = stdout.split("---")[0];
  const autor = stdout.split("---")[1];
  const nombreCommit = stdout.split("---")[2];
  
  const notificacion = new Notification({
    title: `${autor} ha hecho un commit`,
    body: `${nombreCommit}`,
    icon: './src/assets/icono3.ico',
    silent: false
  });

  notificacion.show();

  // Esto lo puedo usar para abrir en el navegador la url del commit que se acaba de hacer
  notificacion.on("click", () => {
    exec("git remote show origin", (error, stdout) => {
      const lineas = stdout.split("\n");
      let urlRepoRemotoDetectado = lineas.find(linea => linea.trim().includes("Fetch URL: "));

      if(urlRepoRemotoDetectado){
        const urlRepoRemoto = urlRepoRemotoDetectado.trim().split("Fetch URL: ")[1].trim();
        const urlRepoRemoto2 = urlRepoRemoto.split(".git")[0]+urlRepoRemoto.split(".git")[1];
        shell.openExternal(`${urlRepoRemoto2}/commit/${hashCommit}`)
      }
    })
  });
})