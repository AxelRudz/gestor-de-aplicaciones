import { Aplicacion } from "./Aplicacion";

export class Angular extends Aplicacion {  

  override getLogoUrl(): string {
    return "./assets/logo-angular.png";
  }

  override iniciar(): void {
    const ruta = this.getRuta();
    const puerto = this.getPuerto();
    const abrir = true;

    this.getTerminal().setMensajes(["Iniciando aplicación..."]);
    this.electronService.send("iniciar-app-angular", {ruta, puerto, abrir})
    this.electronService.on(`iniciar-app-angular-${puerto}`, (event: any, mensaje: string) => {  
      this.getEstado().setEnEjecucion(true);
      this.getTerminal().agregarMensaje(mensaje);
    });
  }  

  override detener(): Promise<boolean> {
    const puerto = this.getPuerto();
    this.getTerminal().setMensajes(["Deteniendo aplicación..."]);
    return this.electronService.invoke('detener-app', puerto)
      .then(ok => {
        if(ok){
          this.electronService.removeAllListeners(`iniciar-app-angular-${puerto}`)
        }
        this.getEstado().setEnEjecucion(!ok);
        this.getTerminal().setMensajes(ok ? ["Aplicación detenida."] : ["Ocurrió un error deteniendo la app."]);
        return ok;
      })
  }
  
}