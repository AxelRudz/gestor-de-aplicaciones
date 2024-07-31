import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "src/app/modelo/aplicaciones/enums/TipoAplicacion";

export class AplicacionOtra extends Aplicacion {

  static getComandoDeArranquePorDefecto(puerto: string): string {
    return ``
  }

  override getLogoUrl(): string {
    return "./assets/icono2.ico";
  }
  
  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.Otra;
  }
}