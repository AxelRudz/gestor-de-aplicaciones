import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { Aplicacion } from './modelo/Aplicacion';
import { AngularApp } from './modelo/AngularApp';
import { SpringApp } from './modelo/AngularApp copy';
import { FormBuilder, Validators } from '@angular/forms';
import { AplicacionService } from './services/aplicacion.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild("btnCerrar") btnCerrar!: ElementRef;

  title = 'gestor-de-aplicaciones';

  aplicaciones: Aplicacion[] = [];

  nombresRamas: {ruta: string, nombre: string}[] = [];

  formularioAgregarAplicacion = this.fb.group({
    tipo: ["angular", [Validators.required]],
    nombre: ["", [Validators.required]],
    puerto: ["", [Validators.required]],
    ruta: ["", [Validators.required]],
  });

  suscripcion!: Subscription;

  constructor(
    private electronService: ElectronService,
    private aplicacionService: AplicacionService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder,
    private renderer: Renderer2,
  ) {}

  ngOnInit(){
    this.suscripcion = this.aplicacionService.aplicacionesSubject.subscribe(aplicaciones => {
      this.aplicaciones = aplicaciones;
      this.aplicaciones.forEach(app => this.obtenerRamaActual(app));
    })
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
    this.electronService.removeAllListeners("ruta");
  }

  abrirDialogRuta() {
    this.electronService.send('abrir-ventana-seleccion-directorio');
    this.electronService.on("ruta", (event: any, ruta: string) => {
      this.formularioAgregarAplicacion.get("ruta")?.setValue(ruta);
      this.formularioAgregarAplicacion.updateValueAndValidity();
      this.cdRef.detectChanges();
    });
  }

  agregarAplicacion(){
    if(this.formularioAgregarAplicacion.valid){
      const f = this.formularioAgregarAplicacion;
      const tipo = f.get('tipo')!.value;
      const nombre = f.get('nombre')!.value!;
      const puerto = f.get('puerto')!.value!;
      const ruta = f.get('ruta')!.value!;

      tipo == "angular"
      ? this.aplicacionService.agregarAplicacion(new AngularApp(nombre, Number.parseInt(puerto), ruta)) 
      : this.aplicacionService.agregarAplicacion(new SpringApp(nombre, Number.parseInt(puerto), ruta));        

      this.renderer.selectRootElement(this.btnCerrar.nativeElement).click(); 
    }
    else {
      alert("Formulario inválido.");
    }
  }

  obtenerRamaActual(app: Aplicacion){
    this.electronService.send('obtener-rama-git', app.getRuta());
    this.electronService.on("respuesta-rama-git", (event: any, response: {ruta: string, nombre: string}) => {
      const rutaYaExistente = this.nombresRamas.find(ruta => ruta.ruta == response.nombre);
      if(rutaYaExistente){
        rutaYaExistente.nombre = response.nombre;
      }
      else {
        this.nombresRamas.push(response);
      }
    })
  }

  getNombreRama(app: Aplicacion){
    const existeRama = this.nombresRamas.find(ramasGuardadas => ramasGuardadas.ruta == app.getRuta());
    if(existeRama){
      return existeRama.nombre;
    }
    return "No disponible";
  }
}
