import { Component } from '@angular/core';
import { AplicacionService } from '../services/aplicacion.service';
import { Aplicacion } from '../modelo/aplicaciones/Aplicacion';

@Component({
  selector: 'app-terminales-apps',
  templateUrl: './terminales-apps.component.html',
  styleUrls: ['./terminales-apps.component.css']
})
export class TerminalesAppsComponent {

  apps: Aplicacion[] = [];

  appElegida: Aplicacion | null = null;

  constructor(
    private aplicacionService: AplicacionService
  ){}

  ngOnInit(){
    this.aplicacionService.aplicaciones$.subscribe(aplicaciones => {
      this.apps = aplicaciones;
      // Si no hay aplicaciones, la elegida es null
      if(this.apps.length == 0){
        this.appElegida = null;
      }
      else {
        // Si hay aplicaciones disponibles pero la elegida es nula o no está, selecciono la primera que me viene
        if(this.appElegida == null || !this.apps.some(app => app.getPuerto() == this.appElegida!.getPuerto())){
          this.appElegida = this.apps[0];
        }
        // Sino, seguiria todo igual
      }
    })
  }

}
