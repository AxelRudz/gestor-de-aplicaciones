import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Aplicacion } from '../modelo/Aplicacion';
import { AngularApp } from '../modelo/AngularApp';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {

  /*aplicaciones: Aplicacion[] = [
    new AngularApp("App 1", 4200, "C:\\Proyectos\\playground"),
    new AngularApp("App 2", 4300, "C:\\Proyectos\\playground"),
    new AngularApp("App 3", 4400, "C:\\Proyectos\\playground"),
  ];*/

  aplicaciones: Aplicacion[] = [];
  aplicacionesSubject: BehaviorSubject<Aplicacion[]> = new BehaviorSubject<Aplicacion[]>(this.aplicaciones);
  
  constructor() { }

  agregarAplicacion(appNueva: Aplicacion){
    const existeUnaAppConElMismoPuerto = this.aplicaciones.some(app => {
      app.getPuerto() == appNueva.getPuerto()
    })

    if(!existeUnaAppConElMismoPuerto){
      this.aplicaciones.push(appNueva);
      this.aplicacionesSubject.next(this.aplicaciones);
    }
  }


}
