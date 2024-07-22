import treeKill from "tree-kill";
import { spawn } from "child_process";
import stripAnsi from "strip-ansi";

class GestorDeApps {
  // { puerto: numero de puerto (usado como identificador), proceso: proceso que esta corriendo la app }[]
  aplicacionesCorriendo = [];  

  getAplicacionesCorriendo(){
    return this.aplicacionesCorriendo;
  }

  agregarAplicacionCorriendo(app){
    this.aplicacionesCorriendo.push(app);
  }

  existeAplicacionCorriendo(puerto){
    return this.aplicacionesCorriendo.some(app => app.puerto == puerto);
  }

  // Evento recibido en el ipcMain de electron, puerto donde quiere iniciar la app, comando para iniciar la app y el canal de respuesta donde envia la info  
  iniciarAplicacion(event, puerto, comando, canalRespuesta){
    if(!this.existeAplicacionCorriendo(puerto)){
      // Creo el proceso
      const child = spawn(comando, {
        shell: true,
      });
  
      // Lo agrego a la lista como una app corriendo
      gestorDeApps.agregarAplicacionCorriendo({puerto: puerto, proceso: child});
      
      // Voy devolviendo los resultados por el canal de respuesta`
      child.stdout.on('data', (data) => {
        if(data){
          console.log(`stdout: ${data}`);
          event.sender.send(`${canalRespuesta}`, stripAnsi(data.toString()));
        }
      });
    
      child.stderr.on('data', (error) => {
        if(error){
          console.error(`stderr: ${error}`);
          event.sender.send(`${canalRespuesta}`, stripAnsi(error.toString()));
        }
      });
    }
    else {
      console.log("La aplicacion con puerto "+puerto+" ya está corriendo y no se puede agregar. Listado = ", this.getAplicacionesCorriendo());
    }
  }

  detenerAplicacion(puerto){
    return new Promise((resolve, reject) => {
      const indexApp = this.aplicacionesCorriendo.findIndex(aplicacionCorriendo => aplicacionCorriendo.puerto == puerto);  
      if(indexApp != -1){
        this.matarProceso(this.aplicacionesCorriendo[indexApp].proceso.pid)
        .then(ok => {
          if(ok){
            this.aplicacionesCorriendo.splice(indexApp, 1);
          }
          resolve(ok);
        })
      }
      resolve(true);
    });
  }

  matarProceso(pid){
    return new Promise((resolve, reject) =>{
      treeKill(pid,'SIGTERM',(err) => {
        resolve(!err)
      });
    });
  }

  async detenerTodasLasApps(){
    return Promise.all(
      [...this.aplicacionesCorriendo].map((app, index) => {
        return this.matarProceso(app.proceso.pid)
        .then(ok => {
          if(ok){
            console.log("Mate la app con puerto "+app.puerto);
            this.aplicacionesCorriendo.splice(index, 1);
          }
        })
      })
    )
  }
}

export const gestorDeApps = new GestorDeApps();