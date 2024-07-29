import { Component } from '@angular/core';
import { Aplicacion } from './modelo/aplicaciones/Aplicacion';
import { AplicacionService } from './services/aplicacion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'repo-manager';

  aplicaciones: Aplicacion[] = [];
  suscripcion!: Subscription;

  appElegidaParaVerTerminal: Aplicacion | null = null;

  constructor(private aplicacionService: AplicacionService){}

  ngOnInit(){
    this.suscripcion = this.aplicacionService.aplicaciones$.subscribe(aplicaciones => this.aplicaciones = aplicaciones);
  }

  ngOnDestroy(){
    this.suscripcion.unsubscribe();
  }

  estanTodasLasAplicacionesCorriendo(): boolean {
    return this.aplicaciones.every(aplicacion => aplicacion.getPidProceso());
  }

  iniciarTodasLasAplicaciones(): void {
    this.aplicacionService.iniciarTodasLasAplicaciones();
  }

  detenerTodasLasAplicaciones(): void {
    this.aplicacionService.detenerTodasLasAplicaciones();
  }

  mostrarTerminalDeApp(app: Aplicacion): void {
    this.appElegidaParaVerTerminal = app;
  }
}
