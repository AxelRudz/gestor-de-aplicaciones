import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Aplicacion } from '../modelo/aplicaciones/Aplicacion';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {  

  private aplicaciones: Aplicacion[] = [];
  private aplicacionesSubject: BehaviorSubject<Aplicacion[]> = new BehaviorSubject<Aplicacion[]>(this.aplicaciones);
  public aplicaciones$: Observable<Aplicacion[]> = this.aplicacionesSubject.asObservable();  

  agregarAplicacion(app: Aplicacion): boolean {
    if(this.aplicaciones.some(appAgregada => appAgregada.getPuerto() == app.getPuerto())){
      return false;
    }
    this.aplicaciones.push(app);
    this.aplicacionesSubject.next(this.aplicaciones);
    return true;
  }

  
  /*detenerApp(app: Aplicacion){
    this.electronService.send("detener-app-angular", app.getPuerto());
    this.electronService.once(`respuesta-detener-app-angular-${app.getPuerto()}`, (event: any, ok: boolean) => {
      if(ok){
        const appGuardada = this.aplicaciones.find(appGuadada => appGuadada.getPuerto() == app.getPuerto())
        if(appGuardada){
          appGuardada.setEnEjecucion(false);
          appGuardada.setTerminal("Se detuvo la aplicación.");
          this.aplicacionesSubject.next(this.aplicaciones);
        }
      }
    });
  }  */

  eliminarApp(puerto: number){
    this.aplicaciones = this.aplicaciones.filter(appAgregada => appAgregada.getPuerto() != puerto);
    this.aplicacionesSubject.next(this.aplicaciones);
  }


}
