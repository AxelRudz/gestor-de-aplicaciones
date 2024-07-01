import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { Aplicacion } from './modelo/Aplicacion';
import { AngularApp } from './modelo/AngularApp';
import { SpringApp } from './modelo/AngularApp copy';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gestor-de-aplicaciones';

  rutaArchivoElegida = "";

  @ViewChild("inputTipo") inputTipo!: ElementRef;
  @ViewChild("inputNombre") inputNombre!: ElementRef;
  @ViewChild("inputPuerto") inputPuerto!: ElementRef;
  @ViewChild("inputRuta") inputRuta!: ElementRef;

  aplicaciones: Aplicacion[] = [
    new AngularApp("App 1", 4200, ""),
    new SpringApp("App 1", 8080, ""),
    new AngularApp("App 3", 4400, ""),
  ]

  constructor(
    private electronService: ElectronService,
    private cdRef: ChangeDetectorRef
  ) {
    this.electronService.on('file-path-response', (event: any, filePath: any) => {
      console.log('File path:', filePath);
      // Ahora puedes usar filePath como desees
    });
  }

  verRutaDeArchivo(archivo: any){
    this.electronService.send("pedido-ver-archivo", archivo);
    this.electronService.on("respuesta-ver-archivo", (event: any, arg: string) => {
      this.rutaArchivoElegida = arg;
      this.cdRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.electronService.removeAllListeners("respuesta-ver-archivo");
  }

  agregarAplicacion(){

    const tipo = this.inputTipo.nativeElement.value;
    const nombre = this.inputNombre.nativeElement.value;
    const puerto = this.inputPuerto.nativeElement.value;
    const archivo = this.inputRuta.nativeElement.value;

    this.verRutaDeArchivo(archivo)
  }

  abrirDialogRuta() {
    this.electronService.send('abrir-ventana-seleccionar-archivo');
    this.electronService.on("ruta", (event: any, arg: string) => {
      this.rutaArchivoElegida = arg;
      this.cdRef.detectChanges();
    });
  }
}
