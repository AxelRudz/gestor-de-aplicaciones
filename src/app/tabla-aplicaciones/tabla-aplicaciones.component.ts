import { Component } from '@angular/core';
import { Aplicacion } from '../modelo/Aplicacion';
import { Subscription } from 'rxjs';
import { AplicacionService } from '../services/aplicacion.service';
import { ElectronService } from '../services/electron.service';

@Component({
  selector: 'app-tabla-aplicaciones',
  templateUrl: './tabla-aplicaciones.component.html',
  styleUrls: ['./tabla-aplicaciones.component.css']
})
export class TablaAplicacionesComponent {

  aplicaciones: Aplicacion[] = [];

  suscripcion!: Subscription;

  timerEstadoApp: any;

  constructor(
    private aplicacionService: AplicacionService,
    private electronService: ElectronService
  ){}  

  ngOnInit(){
    this.suscripcion = this.aplicacionService.aplicacionesSubject.subscribe(aplicaciones => {
      this.aplicaciones = aplicaciones;
      this.aplicaciones.forEach(app => {
        this.escucharCambiosNombreRama(app)
      });
    })
  }

  ngOnDestroy(): void {    
    this.suscripcion.unsubscribe();
    this.aplicaciones.forEach(app => {
      this.electronService.removeAllListeners(`respuesta-rama-git-${app.getPuerto()}`)
    });
  }

  escucharCambiosNombreRama(app: Aplicacion){    
    const puerto = app.getPuerto();
    const ruta = app.getRuta();
    this.electronService.send('obtener-rama-git', {puerto, ruta});
    this.electronService.on(`respuesta-rama-git-${puerto}`, (event: any, response: {ruta: string, nombre: string}) => {
      app.setNombreRamaGit(response.nombre);
    });
  }

  iniciarApp(app: Aplicacion){
    const ruta = app.getRuta();
    const puerto = app.getPuerto();

    this.electronService.send("iniciar-app-angular", {ruta, puerto})
    this.electronService.on(`respuesta-inicio-app-angular-${puerto}`, (event: any, mensajeTerminal: string) => {  
      app.setEnEjecucion(true);
      app.agregarMensajeTerminal(mensajeTerminal);
      this.aplicacionService.actualizarAplicacion(app);
    });
  }

  detenerApp(app: Aplicacion){
    this.electronService.send("detener-app-angular", app.getPuerto());
    this.electronService.once(`respuesta-detener-app-angular-${app.getPuerto()}`, (event: any, ok: boolean) => {
      if(ok){
        app.setEnEjecucion(false);
        app.setTerminal("Se detuvo la aplicación.");
        this.aplicacionService.actualizarAplicacion(app);
      }
    });
  }



}
