import { Component } from '@angular/core';
import { AplicacionService } from '../services/aplicacion.service';
import { Aplicacion } from '../modelo/Aplicacion';

@Component({
  selector: 'app-terminales-apps',
  templateUrl: './terminales-apps.component.html',
  styleUrls: ['./terminales-apps.component.css']
})
export class TerminalesAppsComponent {

  apps: Aplicacion[] = [];

  appElegida: Aplicacion | null = null;

  constructor(private aplicacionService: AplicacionService){}

  ngOnInit(){
    this.aplicacionService.aplicacionesSubject.asObservable().subscribe(aplicaciones => {
      this.apps = aplicaciones;
      if(aplicaciones.length > 0){
        this.appElegida = aplicaciones[0];
      }
    })
  }

}
