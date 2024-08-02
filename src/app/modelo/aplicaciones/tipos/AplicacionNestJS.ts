import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "src/app/modelo/aplicaciones/enums/TipoAplicacion";

export class AplicacionNestJS extends Aplicacion {

  static getComandoDeArranquePorDefecto(puerto: string): string {
    return `npm run start`
  }

  override getLogoUrl(): string {
    return "./assets/logo-nest.ico";
  }

  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.NestJS;
  }
  
}