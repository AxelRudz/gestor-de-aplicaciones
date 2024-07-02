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

  diccionarioNombresRamas: {ruta: string, nombre: string}[] = [];

  suscripcion!: Subscription;

  timerRamas: any;

  constructor(
    private aplicacionService: AplicacionService,
    private electronService: ElectronService,
  ){}  

  ngOnInit(){
    this.suscripcion = this.aplicacionService.aplicacionesSubject.subscribe(aplicaciones => {
      this.aplicaciones = aplicaciones;
      this.aplicaciones.forEach(app => this.obtenerRamaActual(app));
    })

    this.timerRamas = setInterval(()=>{
      this.aplicaciones.forEach(app => this.obtenerRamaActual(app));
    }, 5000);
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
    this.electronService.removeAllListeners("respuesta-rama-git");
  }

  obtenerRamaActual(app: Aplicacion){    
    this.electronService.send('obtener-rama-git', app.getRuta());
    this.electronService.once("respuesta-rama-git", (event: any, response: {ruta: string, nombre: string}) => {
      const laRamaYaEstaEnElDiccionario = this.diccionarioNombresRamas.find(ramaAgregada => ramaAgregada.ruta == response.ruta);
      laRamaYaEstaEnElDiccionario
        ? laRamaYaEstaEnElDiccionario.nombre = response.nombre
        : this.diccionarioNombresRamas.push(response);
    });
  }

  mostrarRamaDesdeElDiccionario(app: Aplicacion){
    const existeRama = this.diccionarioNombresRamas.find(ramasGuardadas => ramasGuardadas.ruta == app.getRuta());
    if(existeRama){
      return existeRama.nombre;
    }
    return "No disponible";
  }



}
