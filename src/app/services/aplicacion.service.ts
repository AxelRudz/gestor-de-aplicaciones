import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Aplicacion } from '../modelo/aplicaciones/tipos/Aplicacion';
import { AplicacionAngular } from '../modelo/aplicaciones/tipos/AplicacionAngular';
import { ElectronService } from './electron.service';
import { AplicacionSpringBoot } from '../modelo/aplicaciones/tipos/AplicacionSpringBoot';
import { AplicacionElectronDTO } from '../modelo/aplicaciones/AplicacionElectronDTO';
import { TipoAplicacion } from '../modelo/aplicaciones/enums/TipoAplicacion';
import { AplicacionOtra } from '../modelo/aplicaciones/tipos/AplicacionOtra';
import { AplicacionNestJS } from '../modelo/aplicaciones/tipos/AplicacionNestJS';

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
      .then((aplicacionesGuardadas: AplicacionElectronDTO[]) => {
        const listadoGeneradoDeApps: Aplicacion[] = [];
        aplicacionesGuardadas.forEach(app => {
          const urlTableroTrello = app.urlTableroTrello ? app.urlTableroTrello : null;
          switch(app.tipo){
            case TipoAplicacion.Angular:
              listadoGeneradoDeApps.push(new AplicacionAngular(app.id, app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this));
              break;
            case TipoAplicacion.SpringBoot:
              listadoGeneradoDeApps.push(new AplicacionSpringBoot(app.id, app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this));
              break;
            case TipoAplicacion.NestJS:
              listadoGeneradoDeApps.push(new AplicacionNestJS(app.id, app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this));
              break;
            case TipoAplicacion.Otra:
              listadoGeneradoDeApps.push(new AplicacionOtra(app.id, app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this));
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
    const aplicacionParaAgregar: AplicacionElectronDTO = {
      id: aplicacion.getId(),
      tipo: aplicacion.getTipoAplicacion(),
      nombre: aplicacion.getNombre(),
      ruta: aplicacion.getRuta(),
      puerto: aplicacion.getPuerto(),
      urlTableroTrello: aplicacion.getUrlTableroTrello(),
      comandoDeArranque: aplicacion.getComandoDeArranque()
    }
    this.electronService.invoke('persistencia-agregar-aplicacion', aplicacionParaAgregar)
      .catch(error => {
        console.error(error);
      })
  }

  persistenciaEliminarAplicacion(aplicacion: Aplicacion): Promise<any>{
    return this.electronService.invoke('persistencia-eliminar-aplicacion', aplicacion.getId(), aplicacion.getPidProceso())
      .catch(error => {
        console.error(error);
      })
  }

  agregarAplicacion(app: Aplicacion): void {
    this.persistenciaAgregarAplicacion(app);
    this.aplicaciones.push(app);
    this.aplicacionesSubject.next(this.aplicaciones);
  }

  eliminarAplicacion(aplicacion: Aplicacion){
    this.persistenciaEliminarAplicacion(aplicacion)
    .then( _ => {
      this.aplicaciones = this.aplicaciones.filter(aplicacionAgregada => aplicacionAgregada.getId() != aplicacion.getId());
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
