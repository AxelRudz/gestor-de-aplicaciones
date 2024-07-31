import { Aplicacion } from "./Aplicacion";
import { TipoAplicacion } from "src/app/modelo/aplicaciones/enums/TipoAplicacion";

export class AplicacionSpringBoot extends Aplicacion {

  static getComandoDeArranquePorDefecto(puerto: string): string {
    return `mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=${puerto}`
  }

  override getLogoUrl(): string {
    return "./assets/logo-spring.png";
  }

  override getTipoAplicacion(): TipoAplicacion {
    return TipoAplicacion.SpringBoot;
  }
  
}