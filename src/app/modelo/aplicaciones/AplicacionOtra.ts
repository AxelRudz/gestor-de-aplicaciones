import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "./AplicacionPersistenciaDTO";

export class AplicacionOtra extends Aplicacion {

  override getLogoUrl(): string {
    return "./assets/icono2.ico";
  }

  override getComandoIniciar(): string {
    return ``
  }
  
  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.Otra;
  }
}