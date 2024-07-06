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
    })
  }

  ngOnDestroy(): void {    
    this.suscripcion.unsubscribe();
    this.aplicaciones.forEach(app => {
      this.electronService.removeAllListeners(`respuesta-rama-git-${app.getPuerto()}`)
    });
  }  

  iniciarApp(app: Aplicacion){
    this.aplicacionService.iniciarApp(app);
  }

  detenerApp(app: Aplicacion){
    this.aplicacionService.detenerApp(app);
  }

  hayMuchasRamas(app: Aplicacion): boolean {
    if(app.getInfoRamas()){
      return app.getInfoRamas()!.ramas.length > 1;
    }
    return false;
  }

  cambiarDeRama(app: Aplicacion, rama: string){
    this.aplicacionService.cambiarDeRama(app, rama);
  }



}
