import { ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Aplicacion } from '../modelo/Aplicacion';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {

  aplicaciones: Aplicacion[] = [];
  aplicacionesSubject: BehaviorSubject<Aplicacion[]> = new BehaviorSubject<Aplicacion[]>(this.aplicaciones);

  agregarAplicacion(appNueva: Aplicacion){
    const existeUnaAppConElMismoPuerto = this.aplicaciones.some(app => {
      app.getPuerto() == appNueva.getPuerto()
    })

    if(!existeUnaAppConElMismoPuerto){
      this.aplicaciones.push(appNueva);
      this.aplicacionesSubject.next(this.aplicaciones);
    }
  }

  actualizarAplicacion(appActualizada: Aplicacion){
    const indexAplicacion = this.aplicaciones.findIndex(app => app.getPuerto() == appActualizada.getPuerto());
    if(indexAplicacion != -1){
      this.aplicaciones[indexAplicacion] = appActualizada;
      this.aplicacionesSubject.next(this.aplicaciones);      
    }
  }


}
