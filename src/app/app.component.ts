import { ChangeDetectorRef, Component } from '@angular/core';
import { AplicacionService } from './services/aplicacion.service';
import { Aplicacion } from './modelo/Aplicacion';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gestor-de-aplicaciones';

  apps: Aplicacion[] = [];

  constructor(
    private aplicacionService: AplicacionService,
    private cdr: ChangeDetectorRef,
  ){}

  ngOnInit(){
    this.aplicacionService.aplicacionesSubject.asObservable().subscribe(aplicaciones => {
      this.apps = aplicaciones;
      this.cdr.detectChanges();
    })
  }


}
