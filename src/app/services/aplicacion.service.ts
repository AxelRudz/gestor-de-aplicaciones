import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Aplicacion } from '../modelo/aplicaciones/tipos/Aplicacion';
import { AplicacionAngular } from '../modelo/aplicaciones/tipos/AplicacionAngular';
import { ElectronService } from './electron.service';
import { AplicacionSpringBoot } from '../modelo/aplicaciones/tipos/AplicacionSpringBoot';
import { AplicacionElectronDTO } from '../modelo/aplicaciones/AplicacionElectronDTO';
import { TipoAplicacion } from '../modelo/aplicaciones/enums/TipoAplicacion';
import { AplicacionOtra } from '../modelo/aplicaciones/tipos/AplicacionOtra';

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
              listadoGeneradoDeApps.push(new AplicacionAngular(app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this))
              break;
            case TipoAplicacion.SpringBoot:
              listadoGeneradoDeApps.push(new AplicacionSpringBoot(app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this))
              break;
            case TipoAplicacion.Otra:
              listadoGeneradoDeApps.push(new AplicacionOtra(app.nombre, app.puerto, app.ruta, urlTableroTrello, app.comandoDeArranque, this.electronService, this))
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
    return this.electronService.invoke('persistencia-eliminar-aplicacion', aplicacion.getPuerto(), aplicacion.getPidProceso())
      .catch(error => {
        console.error(error);
      })
  }

  agregarAplicacion(app: Aplicacion): Promise<void> {
    return new Promise((resolve, reject) => {
      const appConMismoPuerto = this.aplicaciones.find(appAgregada => appAgregada.getPuerto() == app.getPuerto());
      if(appConMismoPuerto){
        reject(`El puerto elegido está siendo usado por: ${appConMismoPuerto.getNombre()}.`);
      }
      else {
        this.persistenciaAgregarAplicacion(app);
        this.aplicaciones.push(app);
        this.aplicacionesSubject.next(this.aplicaciones);
        resolve();
      }
    })  
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
