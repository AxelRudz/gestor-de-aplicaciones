// Obtengo todos los commits que se hicieron en las ramas remotas
// git log --remotes --since="yesterday" --pretty=format:"%H|%an|%s"

// Me sirve para obtener la lista de commits desde ayer en X rama.
// Podria tener un archivo de control con todos los commits remotos al iniciar el dia de hoy.
// Voy consultando cada cierto tiempo y si la consulta tiene mas commits que mi archivo de control,
// agrego esos commits a mi archivo y muestro la informacion de los mismos en una notificacion

// El archivo de control puede tener como nombre la fecha de hoy, de esa forma puedo saber si ya consulté en el dia,
// debo borrar los archivos anteriores, etc...

// Abajo hay codigo de como uso comandos git, notificaciones, etc...
import { Notification, app } from "electron";
import { exec } from "child_process"
import { recuperarAppsGuardadas } from "../PersistenciaApps.js";
import { __dirname } from "../../main.js"
import fs from "fs"
import util from "util"
import path from "path";
import { rejects } from "assert";
const execPromise = util.promisify(exec);


export const inicializarModuloTareasAutomaticas = () => {
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

  const listadoCommits = [];

  resultados.forEach(result => {
    if (result.status === 'fulfilled') {
      const commits = result.value.stdout;
      commits.forEach(commit => {
        if (!listadoCommits.includes(commit)) {
          listadoCommits.push(commit);
        }
      });
    }
    else {
      console.error(`Error procesando la ruta: ${result.reason}`);
    }
  })
  guardarCommitsEnArchivoDeControl(listadoCommits).catch(error => console.error(error))
}

async function promesaListadoCommits(ruta) {
  return execPromise(`cd ${ruta} && git fetch && git log --all --remotes --since="yesterday" --pretty=format:"%H|%an|%s"`)
    .then(({ stdout, stderr }) => {
      if (!stderr) {
        return { stdout: stdout.split("\n"), stderr: "" };
      }
      console.error("Algo salio mal = ", stderr);
      return { stdout: [], stderr };
    })
    .catch(error => {
      console.error("Algo salio mal = ", error.message);
      return { stdout: [], stderr: error.message };
    });
}

function guardarCommitsEnArchivoDeControl(listadoCommits){  
  return new Promise(() => {
    const path = app.getPath('userData');
    const fechaHoy = new Date().toISOString().split("T")[0];
    const filePath = `${path}/Registro commits ${fechaHoy}`;
    try {
      const commitsParaNotificar = [];
      // Leer el archivo para asegurarse de que existe
      const archivo = fs.readFileSync(filePath, 'utf-8');
      // Agregar la nueva línea al final del archivo
      listadoCommits.forEach(commit => {
        if(!archivo.includes(commit)){
          fs.appendFileSync(filePath, `\n${commit}`);
          commitsParaNotificar.push(commit);
        }
      })      
      if(commitsParaNotificar.length <= 5){
        commitsParaNotificar.forEach(commit => {
          const [hash, autor, nombreCommit] = commit.split("|");
          mostrarNotificacion(hash, autor, nombreCommit);
        })
      }
      resolve(true)
    }
    catch(error){
      // Si el archivo no existe, crearlo y agregar la línea
      if (error.code === 'ENOENT') {
        try {
          fs.writeFileSync(filePath, listadoCommits.join("\n"));
          resolve(true);
        } catch (writeError) {
          rejects(writeError);
        }
      } 
      rejects(new Promise(()=>{resolve (false)}));
    }
  })
}

function mostrarNotificacion(hash, autor, nombreCommit){
  const rutaIcono = path.resolve("src", "assets", "icono3.ico");
  const notificacion = new Notification({
    title: `${autor} hizo un commit`,
    body: nombreCommit,
    icon: rutaIcono,
    silent: true
  });
  notificacion.show();
  notificacion.on("click", () => {
    exec("git remote show origin", (error, stdout) => {
      const lineas = stdout.split("\n");
      let urlRepoRemotoDetectado = lineas.find(linea => linea.trim().includes("Fetch URL: "));

      if(urlRepoRemotoDetectado){
        const urlRepoRemoto = urlRepoRemotoDetectado.trim().split("Fetch URL: ")[1].trim();
        const urlRepoRemoto2 = urlRepoRemoto.split(".git")[0]+urlRepoRemoto.split(".git")[1];
        shell.openExternal(`${urlRepoRemoto2}/commit/${hash}`)
      }
    })
  });
}