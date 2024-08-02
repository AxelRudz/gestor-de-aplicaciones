import { ChangeDetectorRef, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '../services/electron.service';
import { AplicacionService } from '../services/aplicacion.service';
import { AplicacionAngular } from '../modelo/aplicaciones/tipos/AplicacionAngular';
import { AplicacionSpringBoot } from '../modelo/aplicaciones/tipos/AplicacionSpringBoot';
import { TipoAplicacion } from '../modelo/aplicaciones/enums/TipoAplicacion';
import { AplicacionOtra } from '../modelo/aplicaciones/tipos/AplicacionOtra';
import { AplicacionNestJS } from '../modelo/aplicaciones/tipos/AplicacionNestJS';

@Component({
  selector: 'app-modal-agregar-app',
  templateUrl: './modal-agregar-app.component.html',
  styleUrls: ['./modal-agregar-app.component.css']
})
export class ModalAgregarAppComponent {

  @ViewChild("btnCerrar") btnCerrar!: ElementRef;

  formularioAgregarAplicacion!: FormGroup;
  mensajeDeError = "";
  // Enum que usa el formulario para elegir el tipo de aplicacion que va a crear
  TipoAplicacion = TipoAplicacion

  constructor(
    private electronService: ElectronService,
    private aplicacionService: AplicacionService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef,
    private renderer: Renderer2
  ){}

  ngOnInit(){
    this.formularioAgregarAplicacion = this.fb.group({
      tipo: ["", [Validators.required]],
      nombre: ["", [Validators.required]],
      puerto: ["", [Validators.required]],
      urlTableroTrello: [""],
      ruta: ["", [Validators.required]],
      comandoDeArranque: [{value: "", disabled: true}, [Validators.required]]
    });
    // Cuando cambia el tipo de app, recalculo el comando de arranque
    this.campoTipo.valueChanges.subscribe((tipo: TipoAplicacion | "") => {
      this.campoComandoDeArranque.setValue(this.devolverComandoIniciarPorDefecto(tipo));
      this.campoComandoDeArranque.updateValueAndValidity();
    })
    // Cuando cambia el puerto de la app, recalculo el comando de arranque (debido a que se debe generar en otro puerto)
    this.campoPuerto.valueChanges.subscribe(puerto => {
      this.campoComandoDeArranque.setValue(this.devolverComandoIniciarPorDefecto(this.campoTipo.value));
      this.campoComandoDeArranque.updateValueAndValidity();
    })
  }

  get campoTipo(){return this.formularioAgregarAplicacion.get("tipo")!}
  get campoNombre(){return this.formularioAgregarAplicacion.get("nombre")!}
  get campoPuerto(){return this.formularioAgregarAplicacion.get("puerto")!}
  get urlTableroTrello(){return this.formularioAgregarAplicacion.get("urlTableroTrello")!}
  get campoRuta(){return this.formularioAgregarAplicacion.get("ruta")!}
  get campoComandoDeArranque(){return this.formularioAgregarAplicacion.get("comandoDeArranque")!}

  abrirDialogRuta() {
    this.electronService.invoke('seleccionar-directorio')
      .then((ruta: string | null) => {
        this.campoRuta.setValue(ruta);
        this.formularioAgregarAplicacion.updateValueAndValidity();
        this.cdRef.detectChanges();
      })
  }

  private devolverComandoIniciarPorDefecto(tipoAplicacion: TipoAplicacion | ""): string {    
    const puerto = this.campoPuerto.value ? this.campoPuerto.value : "0";
    switch(tipoAplicacion){
      case TipoAplicacion.Angular:
        return AplicacionAngular.getComandoDeArranquePorDefecto(puerto);
      case TipoAplicacion.SpringBoot:
        return AplicacionSpringBoot.getComandoDeArranquePorDefecto(puerto);
      case TipoAplicacion.NestJS:
        return AplicacionNestJS.getComandoDeArranquePorDefecto(puerto);
      case TipoAplicacion.Otra:
        return AplicacionOtra.getComandoDeArranquePorDefecto(puerto);
      default:
        return "";
    }
  }

  toggleDisabledCampoComandoDeArranque(){
    this.campoComandoDeArranque.enabled
      ? this.campoComandoDeArranque.disable()
      : this.campoComandoDeArranque.enable();
  }

  agregarAplicacion(){    
    if(this.formularioAgregarAplicacion.valid){
      const nombre = this.campoNombre.value;
      const puerto = this.campoPuerto.value;
      const comandoDeArranque = this.campoComandoDeArranque.value;
      const ruta = this.campoRuta.value;
      const urlTableroTrello = this.urlTableroTrello.value ? this.urlTableroTrello.value : null;

      let app;
      if(this.campoTipo.value == TipoAplicacion.Angular){
        app = new AplicacionAngular(nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService);
      }
      else if(this.campoTipo.value == TipoAplicacion.SpringBoot){
        app = new AplicacionSpringBoot(nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService)
      }
      else if(this.campoTipo.value == TipoAplicacion.NestJS){
        app = new AplicacionNestJS(nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService)
      }
      else {
        app = new AplicacionOtra(nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService)
      }
      
      this.aplicacionService.agregarAplicacion(app)
      .then( _ => {
        this.resetearFormulario();
        this.renderer.selectRootElement(this.btnCerrar.nativeElement, true).click();
      })
      .catch(mensajeDeError => {
        this.mensajeDeError = mensajeDeError;
      })
    }
    else {
      alert("Formulario inválido.");
    }
  }

  resetearFormulario(){
    // Si no especifico tipo: "", no aparece "Seleccione el tipo de aplicación..." en el formulario
    this.formularioAgregarAplicacion.reset({tipo: "", comandoDeArranque: {value: "", disabled: true}}) 
    this.mensajeDeError = "";
  }
}

