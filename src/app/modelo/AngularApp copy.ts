import { Aplicacion } from "./Aplicacion";

export class SpringApp extends Aplicacion {  

  override getUrlLogo(): string {
    return "./assets/logo-spring.png";
  }
  
}