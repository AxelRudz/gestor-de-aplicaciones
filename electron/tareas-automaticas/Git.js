const { Notification, app } = require("electron");
const { exec } = require("child_process");
const { getCacheAplicacionesGuardadas } = require("../PersistenciaApps.js");
const fs = require("fs");
const util = require("util");
const path = require("path");
const { shell } = require("electron");
const execPromise = util.promisify(exec);

const userDataPath = app.getPath('userData');
const filePath = path.join(userDataPath, "Registro de commits");
const fechaHoy = new Date().toISOString().split("T")[0];
const archivoRegistroCommitsPath = path.join(filePath, fechaHoy);

const inicializarModuloTareasAutomaticas = () => {
  crearArchivoControlCommits();
  setInterval(() => verificarCommitsRemotosRepos(), 5000);
}

const crearArchivoControlCommits = () => {
  // Me fijo que exista la carpeta 'Registro de commits, sino la creo
  if(!fs.existsSync(filePath)){    
    fs.mkdirSync(filePath);
  }
  // Borro todos los archivos que no sean del dia actual
  const archivos = fs.readdirSync(filePath);
  archivos.forEach(nombreArchivo => {
    if(nombreArchivo != fechaHoy){
      fs.promises.rm(path.join(filePath, nombreArchivo));
    }
  })
  // Si no existe el archivo con el dia actual, lo creo
  if(!fs.existsSync(archivoRegistroCommitsPath)){
    fs.writeFileSync(archivoRegistroCommitsPath, "", "utf-8");
  }
}

function verificarCommitsRemotosRepos(){
  // getCacheAplicacionesGuardadas(): Aplicacion[] -> Definido en el modelo
  const rutasRepos = getCacheAplicacionesGuardadas().map(aplicacion => aplicacion.ruta);
  guardarCommitsRemotosDeAplicaciones(rutasRepos)
    .catch(error => console.error(error))
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
  return new Promise((resolve, reject) => {
    try {
      // De tipo {ruta, commit}[]
      const notificacionesParaEnviar = [];  
      const commitsRegistrados = fs.readFileSync(archivoRegistroCommitsPath, 'utf-8').split("\n");
      // Agregar la nueva línea al final del archivo
      infoRepos.forEach(repo => {
        repo.commits.forEach(commit => {
          if(!commitsRegistrados.includes(commit)){
            commitsRegistrados.push(commit);          
            notificacionesParaEnviar.push({ruta: repo.ruta, commit});
          }
        })
      })    
      fs.writeFileSync(archivoRegistroCommitsPath, commitsRegistrados.join("\n"));
      // Para no spamear, en el peor de los casos solo muestro las ultimas 5 notificaciones
      if(notificacionesParaEnviar.length > 0){
        notificacionesParaEnviar.slice(-5).forEach(rutaYCommit => {
          const ruta = rutaYCommit.ruta;
          const [hash, autor, nombreCommit] = rutaYCommit.commit.split("|");
          mostrarNotificacion(ruta, hash, autor, nombreCommit);
        })
      }
      resolve(true);
    }
    catch(error){
      reject("Ocurrio un error guardando cambios en el archivo de control de git. Error: ", error);
    }
  })
}

function mostrarNotificacion(ruta, hash, autor, nombreCommit){
  const rutaIcono = path.join(__dirname, "../../src/assets/logo-gitlab.ico");
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