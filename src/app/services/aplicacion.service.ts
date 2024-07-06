import { ChangeDetectorRef, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Aplicacion } from '../modelo/Aplicacion';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class AplicacionService {

  aplicaciones: Aplicacion[] = [];
  aplicacionesSubject: BehaviorSubject<Aplicacion[]> = new BehaviorSubject<Aplicacion[]>(this.aplicaciones);

  constructor(private electronService: ElectronService){}

  ejecutarTareasPeriodicas(){
    this.aplicaciones.forEach(app => this.recuperarDatosRamas(app));
  }

  recuperarDatosRamas(app: Aplicacion){
    const rutaRepo = app.getRuta();
    const puerto = app.getPuerto();
    const body = {
      rutaRepo,
      puerto
    }
    this.electronService.invoke('obtener-info-ramas-git', body)
    .then(response => {
      app.setInfoRamas(response)
      this.aplicacionesSubject.next(this.aplicaciones);
    })
  }

  cambiarDeRama(app: Aplicacion, unaRama: string){
    const rutaRepo = app.getRuta();
    let rama = unaRama;
    if(rama.split("/")[0] == "origin"){
      rama = rama.substring(7)
    }
    const body = {
      rutaRepo,
      rama
    }
    this.electronService.invoke('cambiar-de-rama', body)
    .then(ok => {
      if(ok){
        app.setNombreRamaGit(rama);
        this.aplicacionesSubject.next(this.aplicaciones);
      }
    })
  }

  agregarAplicacion(appNueva: Aplicacion){
    const existeUnaAppConElMismoPuerto = this.aplicaciones.some(app => {
      app.getPuerto() == appNueva.getPuerto()
    })

    if(!existeUnaAppConElMismoPuerto){
      this.aplicaciones.push(appNueva);
      this.escucharCambiosNombreRama(appNueva);
      this.aplicacionesSubject.next(this.aplicaciones);
    }
  }

  escucharCambiosNombreRama(app: Aplicacion){    
    const puerto = app.getPuerto();
    const ruta = app.getRuta();
    this.electronService.send('obtener-rama-git', {puerto, ruta});
    this.electronService.on(`respuesta-rama-git-${puerto}`, (event: any, response: {ruta: string, nombre: string}) => {
      app.setNombreRamaGit(response.nombre);
      this.aplicacionesSubject.next(this.aplicaciones);
    });
  }

  iniciarApp(app: Aplicacion){
    const ruta = app.getRuta();
    const puerto = app.getPuerto();

    this.electronService.send("iniciar-app-angular", {ruta, puerto})
    this.electronService.on(`respuesta-inicio-app-angular-${puerto}`, (event: any, mensajeTerminal: string) => {  
      const appGuardada = this.aplicaciones.find(appGuadada => appGuadada.getPuerto() == app.getPuerto())
      if(appGuardada){
        appGuardada.setEnEjecucion(true);
        appGuardada.agregarMensajeTerminal(mensajeTerminal);
        this.aplicacionesSubject.next(this.aplicaciones);
      }
    });
  }

  detenerApp(app: Aplicacion){
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
  }  


}
