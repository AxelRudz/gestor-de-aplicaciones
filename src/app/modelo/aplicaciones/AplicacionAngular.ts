import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "./AplicacionPersistenciaDTO";

export class AplicacionAngular extends Aplicacion {

  override getLogoUrl(): string {
    return "./assets/logo-angular.png";
  }

  override getComandoIniciar(): string {
    return `ng serve -o --port ${this.getPuerto()}`;
  }  

  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.Angular
  }
  
}