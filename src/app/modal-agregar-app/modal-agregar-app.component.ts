import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ElectronService } from '../services/electron.service';
import { AplicacionService } from '../services/aplicacion.service';
import { AplicacionAngular } from '../modelo/aplicaciones/AplicacionAngular';
import { AplicacionSpringBoot } from '../modelo/aplicaciones/AplicacionSpringBoot';

@Component({
  selector: 'app-modal-agregar-app',
  templateUrl: './modal-agregar-app.component.html',
  styleUrls: ['./modal-agregar-app.component.css']
})
export class ModalAgregarAppComponent {

  @ViewChild("btnCerrar") btnCerrar!: ElementRef;

  formularioAgregarAplicacion = this.fb.group({
    tipo: ["Angular", [Validators.required]],
    nombre: ["", [Validators.required]],
    puerto: ["", [Validators.required]],
    ruta: ["", [Validators.required]],
  });

  constructor(
    private electronService: ElectronService,
    private aplicacionService: AplicacionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2
  ){}

  ngOnDestroy(): void {
    this.electronService.removeAllListeners("ruta");
  }

  abrirDialogRuta() {
    this.electronService.invoke('seleccionar-directorio')
      .then((ruta: string | null) => {
        this.formularioAgregarAplicacion.get("ruta")?.setValue(ruta);
        this.formularioAgregarAplicacion.updateValueAndValidity();
        this.cdRef.detectChanges();
      })
  }

  agregarAplicacion(){
    if(this.formularioAgregarAplicacion.valid){
      
      const f = this.formularioAgregarAplicacion;
      const tipo = f.get('tipo')!.value;
      const nombre = f.get('nombre')!.value!;
      const puerto = f.get('puerto')!.value!;
      const ruta = f.get('ruta')!.value!;

      const app = tipo == "Angular"
        ? new AplicacionAngular(nombre, Number.parseInt(puerto), ruta, this.electronService, this.aplicacionService)
        : new AplicacionSpringBoot(nombre, Number.parseInt(puerto), ruta, this.electronService, this.aplicacionService)
      
      if(this.aplicacionService.agregarAplicacion(app)){
        this.formularioAgregarAplicacion.reset({tipo: "Angular"})
        this.renderer.selectRootElement(this.btnCerrar.nativeElement, true).click();
      }
    }
    else {
      alert("Formulario inválido.");
    }
  }


}
