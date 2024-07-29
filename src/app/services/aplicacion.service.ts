import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Aplicacion } from '../modelo/aplicaciones/Aplicacion';
import { AplicacionAngular } from '../modelo/aplicaciones/AplicacionAngular';
import { ElectronService } from './electron.service';
import { AplicacionSpringBoot } from '../modelo/aplicaciones/AplicacionSpringBoot';
import { AplicacionPersistenciaDTO, TipoAplicacion } from '../modelo/aplicaciones/AplicacionPersistenciaDTO';
import { AplicacionOtra } from '../modelo/aplicaciones/AplicacionOtra';

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
    this.electronService.invoke('persistencia-recuperar-aplicaciones-guardadas')
      .then((aplicacionesGuardadas: AplicacionPersistenciaDTO[]) => {
        const listadoGeneradoDeApps: Aplicacion[] = [];
        aplicacionesGuardadas.forEach(app => {
          switch(app.tipo){
            case TipoAplicacion.Angular:
              listadoGeneradoDeApps.push(new AplicacionAngular(app.nombre, app.puerto, app.ruta, this.electronService, this))
              break;
            case TipoAplicacion.SpringBoot:
              listadoGeneradoDeApps.push(new AplicacionSpringBoot(app.nombre, app.puerto, app.ruta, this.electronService, this))
              break;
            case TipoAplicacion.Otra:
              listadoGeneradoDeApps.push(new AplicacionOtra(app.nombre, app.puerto, app.ruta, this.electronService, this))
              break;
          }
        });
        this.aplicaciones = listadoGeneradoDeApps;
        this.aplicacionesSubject.next(this.aplicaciones);
      })
      .catch(error => {
        console.error("Error al leer el archivo de configuracion: ", error);
      })
  }

  persistenciaAgregarAplicacion(aplicacion: Aplicacion){
    const aplicacionParaAgregar: AplicacionPersistenciaDTO = {
      tipo: aplicacion.getTipoAplicacion(),
      nombre: aplicacion.getNombre(),
      ruta: aplicacion.getRuta(),
      puerto: aplicacion.getPuerto(),
      comandoIniciar: aplicacion.getComandoIniciar()
    }
    this.electronService.invoke('persistencia-agregar-aplicacion', aplicacionParaAgregar)
      .catch(error => {
        console.error(error);
      })
  }

  persistenciaEliminarAplicacion(aplicacion: Aplicacion): Promise<any>{
    return this.electronService.invoke('persistencia-eliminar-aplicacion', aplicacion.getPuerto(), aplicacion.getPidProceso())
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

  eliminarAplicacion(aplicacion: Aplicacion){
    this.persistenciaEliminarAplicacion(aplicacion)
    .then( _ => {
      this.aplicaciones = this.aplicaciones.filter(aplicacionAgregada => aplicacionAgregada.getPuerto() != aplicacion.getPuerto());
      this.aplicacionesSubject.next(this.aplicaciones);
    })
  }

  iniciarTodasLasAplicaciones(): void {
    this.aplicaciones.forEach(aplicacion => {
      if(!aplicacion.getPidProceso()){
        aplicacion.iniciar();
      }
    })
  }

  detenerTodasLasAplicaciones(): void {
    this.aplicaciones.forEach(async aplicacion => {
      if(aplicacion.getPidProceso()){
        await aplicacion.detener();
      }
    })
  }


}
