import { Aplicacion } from "./Aplicacion";

export class SpringBoot extends Aplicacion {

  override getLogoUrl(): string {
    return "./assets/logo-spring.png";
  }

  override iniciar(): void {
    const ruta = this.getRuta();
    const puerto = this.getPuerto();    

    this.getTerminal().setMensajes(["Iniciando aplicación..."]);
    this.electronService.send("iniciar-app-spring-boot", {ruta, puerto})
    this.electronService.on(`iniciar-app-spring-boot-${puerto}`, (event: any, mensaje: string) => {  
      this.getEstado().setEnEjecucion(true);
      this.getTerminal().agregarMensaje(mensaje);
    });
  }  

  override detener(): Promise<boolean> {
    const puerto = this.getPuerto();
    this.getTerminal().setMensajes(["Deteniendo aplicación..."]);
    return this.electronService.invoke('detener-app-spring-boot', puerto)
      .then(ok => {
        if(ok){
          this.electronService.removeAllListeners(`iniciar-app-spring-boot-${puerto}`)
        }
        this.getEstado().setEnEjecucion(!ok);
        this.getTerminal().setMensajes(ok ? ["Aplicación detenida."] : ["Ocurrió un error deteniendo la app."]);
        return ok;
      })
  }
  
}