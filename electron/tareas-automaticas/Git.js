// Obtengo todos los commits que se hicieron en las ramas remotas
// git log --remotes --since="yesterday" --pretty=format:"%H|%an|%s"

// Me sirve para obtener la lista de commits desde ayer en X rama.
// Podria tener un archivo de control con todos los commits remotos al iniciar el dia de hoy.
// Voy consultando cada cierto tiempo y si la consulta tiene mas commits que mi archivo de control,
// agrego esos commits a mi archivo y muestro la informacion de los mismos en una notificacion

// El archivo de control puede tener como nombre la fecha de hoy, de esa forma puedo saber si ya consulté en el dia,
// debo borrar los archivos anteriores, etc...

// Abajo hay codigo de como uso comandos git, notificaciones, etc...
const { Notification, app } = require("electron");
const { exec } = require("child_process");
const { recuperarAppsGuardadas } = require("../PersistenciaApps.js");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { rejects } = require("assert");
const { shell } = require("electron");
const execPromise = util.promisify(exec);


const inicializarModuloTareasAutomaticas = () => {
  setInterval(() => verificarCommitsRemotosRepos(), 5000);
}

function verificarCommitsRemotosRepos(){
  recuperarAppsGuardadas()
  .then(lineasApps => {
    const rutas = lineasApps.map(lineaApp => {
      const [tipo, nombre, puerto, ruta] = lineaApp.split("|||");
      return ruta;
    });
    guardarCommitsRemotosDeAplicaciones(rutas)
      .catch(error => console.error(error))
  })
  .catch(error => console.error(error));
}

async function guardarCommitsRemotosDeAplicaciones(rutas){
  const arregloPromesas = rutas.map(ruta => {
    return promesaListadoCommits(ruta);
  });

  const resultados = await Promise.allSettled(arregloPromesas);

  // Almacena {ruta: string, commits: string[]}[]
  const infoRepos = [];

  resultados.forEach(result => {
    if (result.status === 'fulfilled') {
      const ruta = result.value.stdout.ruta
      const commits = result.value.stdout.commits;
      // Si no fue agregado
      if(!infoRepos.some(repo => repo.ruta == ruta)){
        infoRepos.push({ruta, commits: commits})
      }
    }
    else {
      console.error(`Error procesando la ruta: ${result.reason}`);
    }
  })
  guardarCommitsEnArchivoDeControl(infoRepos).catch(error => console.error(error))
}

async function promesaListadoCommits(ruta) {
  return execPromise(`cd ${ruta} && git fetch && git log --remotes --since="yesterday" --pretty=format:"%H|%an|%s"`)
    .then(({ stdout, stderr }) => {
      if (!stderr) {
        return { stdout: {ruta, commits: stdout.split("\n")}, stderr: "" };
      }
      console.error("Algo salio mal = ", stderr);
      return { stdout: {ruta, commits: []}, stderr: "" };
    })
    .catch(error => {
      console.error("Algo salio mal = ", error.message);
      return { stdout: {ruta, commits: []}, stderr: error.message };
    });
}

// infoRepos es de tipo {ruta: string, commits: string[]}[]
function guardarCommitsEnArchivoDeControl(infoRepos){  
  return new Promise(() => {
    const path = app.getPath('userData');
    const fechaHoy = new Date().toISOString().split("T")[0];
    const filePath = `${path}/Registro commits ${fechaHoy}`;
    try {
      // De tipo {ruta, commit}[]
      const notificacionesParaEnviar = [];
      // Leer el archivo para asegurarse de que existe
      const archivo = fs.readFileSync(filePath, 'utf-8');
      // Agregar la nueva línea al final del archivo
      infoRepos.forEach(repo => {
        repo.commits.forEach(commit => {
          if(!archivo.includes(commit)){
            fs.appendFileSync(filePath, `\n${commit}`);
            const ruta = repo.ruta;
            notificacionesParaEnviar.push({ruta, commit});
          }
        })
      })      
      if(notificacionesParaEnviar.length <= 5){
        notificacionesParaEnviar.forEach(rutaCommit => {
          const ruta = rutaCommit.ruta;
          const [hash, autor, nombreCommit] = rutaCommit.commit.split("|");
          mostrarNotificacion(ruta, hash, autor, nombreCommit);
        })
      }
      resolve(true)
    }
    catch(error){
      // Si el archivo no existe, crearlo y agregar la línea
      if (error.code === 'ENOENT') {
        try {
          const listadoCommits = [];
          infoRepos.forEach(repo => {
            repo.commits.forEach(commit => {
              if(!listadoCommits.includes(commit)){
                listadoCommits.push(commit);
              }
            })
          })
          fs.writeFileSync(filePath, listadoCommits.join("\n"));
          resolve(true);
        } catch (writeError) {
          rejects(new Promise(()=>{resolve (writeError)}));
        }
      } 
      rejects(new Promise(()=>{resolve (false)}));
    }
  })
}

function mostrarNotificacion(ruta, hash, autor, nombreCommit){
  const rutaIcono = path.resolve("src", "assets", "logo-gitlab.ico");
  const notificacion = new Notification({
    title: `${autor} hizo un commit`,
    body: nombreCommit,
    icon: rutaIcono,
    silent: true
  });
  notificacion.on("click", () => {
    exec(`cd ${ruta} && git remote show origin`, (error, stdout) => {
      const lineas = stdout.split("\n");
      let urlRepoRemotoDetectado = lineas.find(linea => linea.trim().includes("Fetch URL: "));
      
      if(urlRepoRemotoDetectado){
        const urlRepoRemoto = urlRepoRemotoDetectado.trim().split("Fetch URL: ")[1].trim();
        const urlRepoRemoto2 = urlRepoRemoto.split(".git")[0]+urlRepoRemoto.split(".git")[1];
        if(urlRepoRemoto.includes("github")){
          shell.openExternal(`${urlRepoRemoto2}/commit/${hash}`)
        }
        if(urlRepoRemoto.includes("gitlab")){
          shell.openExternal(`${urlRepoRemoto2}/-/commit/${hash}`)
        }
      }
    })
  });
  notificacion.show();
}

module.exports = {
  inicializarModuloTareasAutomaticas
}