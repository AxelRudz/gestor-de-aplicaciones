import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output, Renderer2, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ElectronService } from '../services/electron.service';
import { AplicacionService } from '../services/aplicacion.service';
import { AplicacionAngular } from '../modelo/aplicaciones/tipos/AplicacionAngular';
import { AplicacionSpringBoot } from '../modelo/aplicaciones/tipos/AplicacionSpringBoot';
import { TipoAplicacion } from '../modelo/aplicaciones/enums/TipoAplicacion';
import { AplicacionOtra } from '../modelo/aplicaciones/tipos/AplicacionOtra';
import { AplicacionNestJS } from '../modelo/aplicaciones/tipos/AplicacionNestJS';
import { Aplicacion } from '../modelo/aplicaciones/tipos/Aplicacion';

@Component({
  selector: 'app-modal-agregar-app',
  templateUrl: './modal-agregar-app.component.html',
  styleUrls: ['./modal-agregar-app.component.css']
})
export class ModalAgregarAppComponent {

  @Input({required: true}) appElegidaParaEditar!: Aplicacion | null;
  @Output() seCerroElModal = new EventEmitter<void>();

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

  ngOnChanges(simpleChanges: SimpleChanges){
    if(simpleChanges["appElegidaParaEditar"]){
      this.ngOnInit();
    }
  }

  ngOnInit(){
    this.formularioAgregarAplicacion = this.fb.group({
      tipo: [this.appElegidaParaEditar ? this.appElegidaParaEditar.getTipoAplicacion():"", [Validators.required]],
      nombre: [this.appElegidaParaEditar ? this.appElegidaParaEditar.getNombre() :"", [Validators.required]],
      puerto: [this.appElegidaParaEditar ? this.appElegidaParaEditar.getPuerto() :"", [Validators.required]],
      urlTableroTrello: [this.appElegidaParaEditar ? this.appElegidaParaEditar.getUrlTableroTrello() :""],
      ruta: [this.appElegidaParaEditar ? this.appElegidaParaEditar.getRuta() :"", [Validators.required]],
      comandoDeArranque: [{
        value: this.appElegidaParaEditar ? this.appElegidaParaEditar.getComandoDeArranque() :"",
        disabled: this.appElegidaParaEditar ? false : true
      }, [Validators.required]]
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

  agregarEditarAplicacion(){    
    if(this.formularioAgregarAplicacion.valid){
      const id = this.appElegidaParaEditar ? this.appElegidaParaEditar.getId() : Aplicacion.nextID++;
      const nombre = this.campoNombre.value;
      const puerto = this.campoPuerto.value;
      const comandoDeArranque = this.campoComandoDeArranque.value;
      const ruta = this.campoRuta.value;
      const urlTableroTrello = this.urlTableroTrello.value ? this.urlTableroTrello.value : null;
      
      let app;
      if(this.campoTipo.value == TipoAplicacion.Angular){
        app = new AplicacionAngular(id, nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService);
      }
      else if(this.campoTipo.value == TipoAplicacion.SpringBoot){
        app = new AplicacionSpringBoot(id, nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService)
      }
      else if(this.campoTipo.value == TipoAplicacion.NestJS){
        app = new AplicacionNestJS(id, nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService)
      }
      else {
        app = new AplicacionOtra(id, nombre, Number.parseInt(puerto), ruta, urlTableroTrello, comandoDeArranque, this.electronService, this.aplicacionService)
      }

      if(!this.appElegidaParaEditar){
        this.aplicacionService.agregarAplicacion(app)
      }
      else {
        this.aplicacionService.editarAplicacion(app)
      }
      this.cerrarModal();
    }
    else {
      alert("Formulario inválido.");
    }
  }

  cerrarModal(){    
    // Si no especifico tipo: "", no aparece "Seleccione el tipo de aplicación..." en el formulario
    this.formularioAgregarAplicacion.reset({tipo: "", comandoDeArranque: {value: "", disabled: true}}) 
    this.appElegidaParaEditar = null;
    this.mensajeDeError = "";
    this.renderer.selectRootElement(this.btnCerrar.nativeElement, true).click();
    this.seCerroElModal.emit();
  }
}

