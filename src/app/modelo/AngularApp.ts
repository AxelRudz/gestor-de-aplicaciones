import { Aplicacion } from "./Aplicacion";

export class AngularApp extends Aplicacion {  

  override getUrlLogo(): string {
    return "./assets/logo-angular.png";
  }
  
}