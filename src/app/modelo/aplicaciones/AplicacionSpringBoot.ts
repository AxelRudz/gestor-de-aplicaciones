import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "./AplicacionPersistenciaDTO";

export class AplicacionSpringBoot extends Aplicacion {

  override getLogoUrl(): string {
    return "./assets/logo-spring.png";
  }

  override getComandoIniciar(): string {
    return `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=${this.getPuerto()}`
  }

  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.SpringBoot;
  }
  
}