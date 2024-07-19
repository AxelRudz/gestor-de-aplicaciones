import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Aplicacion } from '../modelo/aplicaciones/Aplicacion';
import { Angular } from '../modelo/aplicaciones/Angular';
import { ElectronService } from './electron.service';
import { SpringBoot } from '../modelo/aplicaciones/SpringBoot';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {  

  private aplicaciones: Aplicacion[] = [
    //new Angular("Prueba", 5000, "C:\\Proyectos\\prueba", this.electronService, this)
  ];

  private aplicacionesSubject: BehaviorSubject<Aplicacion[]> = new BehaviorSubject<Aplicacion[]>(this.aplicaciones);
  public aplicaciones$: Observable<Aplicacion[]> = this.aplicacionesSubject.asObservable();

  constructor(private electronService: ElectronService){
    this.recuperarAplicacionesGuardadas();
  }

  recuperarAplicacionesGuardadas(){
    this.electronService.invoke('recuperar-aplicaciones-guardadas')
      .then((apps: string[]) => {
        const listadoGeneradoDeApps: Aplicacion[] = [];
        apps.forEach(app => {
          const atributos = app.split("|||");
          const tipo = atributos[0];
          const nombre = atributos[1];
          const puerto = atributos[2];
          const ruta = atributos[3];

          if(tipo == "Angular"){
            listadoGeneradoDeApps.push(new Angular(nombre, parseInt(puerto), ruta, this.electronService, this))
          }
          if(tipo == "Spring-Boot"){
            listadoGeneradoDeApps.push(new SpringBoot(nombre, parseInt(puerto), ruta, this.electronService, this))
          }
        });
        this.aplicaciones = listadoGeneradoDeApps;
        this.aplicacionesSubject.next(this.aplicaciones);
      })
      .catch(error => {
        console.log("Error al leer el archivo de configuracion: ", error);
      })
  }

  persistenciaAgregarAplicacion(app: Aplicacion){
    let tipo;
    if(app instanceof Angular){
      tipo = "Angular"
    }
    if(app instanceof SpringBoot){
      tipo = "Spring-Boot"
    }
    if(!tipo){
      return;
    }
    const linea = `${tipo}|||${app.getNombre()}|||${app.getPuerto()}|||${app.getRuta()}`
    
    this.electronService.invoke('persistencia-agregar-aplicacion', linea)
      .catch(error => {
        console.error(error);
      })
  }

  persistenciaEliminarAplicacion(nroPuerto: number){
    const puerto = nroPuerto.toString();
    this.electronService.invoke('persistencia-eliminar-aplicacion', puerto)
      .catch(error => {
        console.error(error);
      })
  }

  agregarAplicacion(app: Aplicacion): boolean {
    if(this.aplicaciones.some(appAgregada => appAgregada.getPuerto() == app.getPuerto())){
      return false;
    }
    this.persistenciaAgregarAplicacion(app);
    this.aplicaciones.push(app);
    this.aplicacionesSubject.next(this.aplicaciones);
    return true;
  }

  eliminarAplicacion(puerto: number){
    this.persistenciaEliminarAplicacion(puerto);
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
