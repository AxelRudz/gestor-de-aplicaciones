import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Aplicacion } from '../modelo/aplicaciones/Aplicacion';
import { Angular } from '../modelo/aplicaciones/Angular';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {  

  private aplicaciones: Aplicacion[] = [
    new Angular("Prueba", 5000, "C:\\Proyectos\\prueba", this.electronService, this)
  ];

  private aplicacionesSubject: BehaviorSubject<Aplicacion[]> = new BehaviorSubject<Aplicacion[]>(this.aplicaciones);
  public aplicaciones$: Observable<Aplicacion[]> = this.aplicacionesSubject.asObservable();  

  constructor(private electronService: ElectronService){}

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

  iniciarTodasLasAplicaciones(): void {
    this.aplicaciones.forEach(aplicacion => {
      if(aplicacion.getEstado().estaEnEjecucion() == false){
        aplicacion.iniciar();
      }
    })
  }

  detenerTodasLasAplicaciones(): void {
    this.aplicaciones.forEach(aplicacion => {
      if(aplicacion.getEstado().estaEnEjecucion() == true){
        aplicacion.detener();
      }
    })
  }


}
