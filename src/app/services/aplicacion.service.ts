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

  eliminarAplicacion(puerto: number){
    this.aplicaciones = this.aplicaciones.filter(appAgregada => appAgregada.getPuerto() != puerto);
    this.aplicacionesSubject.next(this.aplicaciones);
  }


}
