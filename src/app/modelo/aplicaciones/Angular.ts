import { Aplicacion } from "./Aplicacion";

export class Angular extends Aplicacion {  

  override getLogoUrl(): string {
    return "./assets/logo-angular.png";
  }

  override iniciar(): void {
    const ruta = this.getRuta();
    const puerto = this.getPuerto();
    const abrir = true;

    this.getTerminal().setMensajes(["Iniciando aplicacion..."]);
    this.electronService.send("iniciar-app-angular", {ruta, puerto, abrir})
    this.electronService.on(`iniciar-app-angular-${puerto}`, (event: any, mensaje: string) => {  
      this.ngZone.run(() => {
        this.getEstado().setEnEjecucion(true);
        this.getTerminal().agregarMensaje(mensaje);
      });
    });
  }  

  override detener(): Promise<boolean> {
    const puerto = this.getPuerto();
    this.getTerminal().setMensajes(["Deteniendo aplicación..."]);
    return this.electronService.invoke('detener-app-angular', puerto)
      .then(ok => {
        this.ngZone.run(() => {
          if(ok){
            this.electronService.removeAllListeners(`iniciar-app-angular-${puerto}`)
          }
          this.getEstado().setEnEjecucion(!ok);
          this.getTerminal().setMensajes(ok ? ["Aplicación detenida."] : ["Ocurrió un error deteniendo la app."]);
        })
        return ok;
      })
  }

  override eliminar(): void {
    this.detener()
    .then(ok => {
      this.ngZone.run(() => {
        if(ok){
          this.aplicacionService.eliminarAplicacion(this.getPuerto());
          this.getGit().removeListeners();
        }
      });
    })    
  }
  
}