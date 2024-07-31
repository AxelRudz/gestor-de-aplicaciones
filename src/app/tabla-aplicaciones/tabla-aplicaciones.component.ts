import { Component, EventEmitter, Output } from '@angular/core';
import { Aplicacion } from '../modelo/aplicaciones/tipos/Aplicacion';
import { Subscription } from 'rxjs';
import { AplicacionService } from '../services/aplicacion.service';
import { AplicacionAngular } from '../modelo/aplicaciones/tipos/AplicacionAngular';

@Component({
  selector: 'app-tabla-aplicaciones',
  templateUrl: './tabla-aplicaciones.component.html',
  styleUrls: ['./tabla-aplicaciones.component.css']
})
export class TablaAplicacionesComponent {

  @Output() seInteractuoConUnaApp: EventEmitter<Aplicacion> = new EventEmitter<Aplicacion>();

  aplicaciones: Aplicacion[] = [];

  suscripcion!: Subscription;

  constructor(private aplicacionService: AplicacionService){}  

  ngOnInit(){
    this.suscripcion = this.aplicacionService.aplicaciones$.subscribe(aplicaciones => {
      this.aplicaciones = aplicaciones;
    })
  }

  ngOnDestroy(): void {    
    this.suscripcion.unsubscribe();
  }  

  hayMuchasRamas(app: Aplicacion): boolean {
    return app.getGit().getRamasDisponibles().length > 1;
  }

  esUnaAppAngular(app: Aplicacion): boolean {
    return app instanceof(AplicacionAngular);
  }

  estaEnEjecucion(app: Aplicacion): boolean {
    return app.getPidProceso() != null;
  }

  toggleApp(app: Aplicacion): void {
    if(this.estaEnEjecucion(app)){
      app.detener()
        .then(ok => {          
          this.emitirCambioApp(app);
        })
        .catch(error => console.error("Ocurrió un error deteniendo la app. Error: ", error));
    }
    else {
      app.iniciar();
      this.emitirCambioApp(app);
    }    
  }

  moverseDeRama(app: Aplicacion, rama: string){
    app.getGit().gitCheckout(rama);
    this.emitirCambioApp(app);
  }

  gitPull(app: Aplicacion){
    app.getGit().gitPull();
    this.emitirCambioApp(app);
  }

  emitirCambioApp(app: Aplicacion){
    this.seInteractuoConUnaApp.emit(app);
  }



}