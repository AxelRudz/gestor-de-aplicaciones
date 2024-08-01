import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "src/app/modelo/aplicaciones/enums/TipoAplicacion";

export class AplicacionAngular extends Aplicacion {

  static getComandoDeArranquePorDefecto(puerto: string): string {
    return `ng serve --port ${puerto}`
  }

  override getLogoUrl(): string {
    return "./assets/logo-angular.png";
  }

  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.Angular
  }
  
}