import { Aplicacion } from "./Aplicacion";

export class SpringBoot extends Aplicacion {  

  override getLogoUrl(): string {
    return "./assets/logo-spring.png";
  }

  override iniciar(): void {
    
  }

  override detener(): void {
    
  }

  override eliminar(): void {
    
  }
  
}