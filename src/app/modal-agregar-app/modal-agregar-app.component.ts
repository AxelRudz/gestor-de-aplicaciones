import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ElectronService } from '../services/electron.service';
import { AplicacionService } from '../services/aplicacion.service';
import { AngularApp } from '../modelo/AngularApp';
import { SpringApp } from '../modelo/AngularApp copy';

@Component({
  selector: 'app-modal-agregar-app',
  templateUrl: './modal-agregar-app.component.html',
  styleUrls: ['./modal-agregar-app.component.css']
})
export class ModalAgregarAppComponent {

  @ViewChild("btnCerrar") btnCerrar!: ElementRef;

  formularioAgregarAplicacion = this.fb.group({
    tipo: ["angular", [Validators.required]],
    nombre: ["", [Validators.required]],
    puerto: ["", [Validators.required]],
    ruta: ["", [Validators.required]],
  });

  constructor(
    private electronService: ElectronService,
    private aplicacionService: AplicacionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2,
  ){}

  ngOnDestroy(): void {
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

      if(!this.aplicacionService.aplicaciones.some(app => app.getNombre() == nombre)){
        tipo == "angular"
        ? this.aplicacionService.agregarAplicacion(new AngularApp(nombre, Number.parseInt(puerto), ruta)) 
        : this.aplicacionService.agregarAplicacion(new SpringApp(nombre, Number.parseInt(puerto), ruta));        
  
        this.renderer.selectRootElement(this.btnCerrar.nativeElement).click(); 
      }      
    }
    else {
      alert("Formulario inválido.");
    }
  }


}
