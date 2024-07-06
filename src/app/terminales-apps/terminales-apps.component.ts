import { ChangeDetectorRef, Component } from '@angular/core';
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

  constructor(
    private aplicacionService: AplicacionService
  ){}

  ngOnInit(){
    this.aplicacionService.aplicacionesSubject.subscribe(aplicaciones => {
      this.apps = aplicaciones;
      if(this.appElegida && this.apps.find(app => app.getPuerto() == this.appElegida!.getPuerto())){
        this.appElegida = this.apps.find(app => app.getPuerto() == this.appElegida!.getPuerto())!;
      }
      else {
        this.appElegida = this.apps.length > 0
          ? this.apps[0]
          : null;
      }
    })
  }

}
