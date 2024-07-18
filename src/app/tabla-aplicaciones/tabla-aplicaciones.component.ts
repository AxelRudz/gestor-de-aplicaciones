import { Component } from '@angular/core';
import { Aplicacion } from '../modelo/aplicaciones/Aplicacion';
import { Subscription } from 'rxjs';
import { AplicacionService } from '../services/aplicacion.service';
import { Angular } from '../modelo/aplicaciones/Angular';

@Component({
  selector: 'app-tabla-aplicaciones',
  templateUrl: './tabla-aplicaciones.component.html',
  styleUrls: ['./tabla-aplicaciones.component.css']
})
export class TablaAplicacionesComponent {

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
    return app instanceof(Angular);
  }

  estaEnEjecucion(app: Aplicacion): boolean {
    return app.getEstado().estaEnEjecucion();
  }



}