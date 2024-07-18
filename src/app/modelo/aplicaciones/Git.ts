import { NgZone } from "@angular/core";
import { ElectronService } from "src/app/services/electron.service";
import { Terminal } from "./Terminal";

export class Git {
  
  private rutaRepo: string;
  private puerto: number;
  private ramaActual: string;
  private ramasDisponibles: string[];
  private ramaDesactualizada: boolean;
  private electronService: ElectronService;
  private ngZone: NgZone;
  private intervaloTareasPeriodicas: any;
  private terminal: Terminal;

  constructor(rutaRepo: string, puerto: number, electronService: ElectronService, ngZone: NgZone, terminal: Terminal){
    this.rutaRepo = rutaRepo;
    this.puerto = puerto;
    this.ramaActual = "";
    this.ramasDisponibles = [];
    this.ramaDesactualizada = false;
    this.electronService = electronService;
    this.ngZone = ngZone;
    this.terminal = terminal;
    this.observarRamaGit();
    this.intervaloTareasPeriodicas = setInterval(this.tareasPeriodicas, 5000);
  }

  getRutaRepo(): string {
    return this.rutaRepo;
  }

  setRutaRepo(ruta: string): void {
    this.rutaRepo = ruta;
  }

  getRamaActual(): string {
    return this.ramaActual;
  }

  setRamaActual(ramaActual: string): void {
    this.ramaActual = ramaActual;
  }

  getRamasDisponibles(): string[] {
    return this.ramasDisponibles;
  }

  setRamasDisponibles(ramasDisponibles: string[]): void {
    this.ramasDisponibles = ramasDisponibles;
  }

  getRamaDesactualizada(): boolean {
    return this.ramaDesactualizada;
  }

  setRamaDesactualizada(ramaDesactualizada: boolean): void {
    this.ramaDesactualizada = ramaDesactualizada;
  }

  gitCheckout(rama: string): void {
    const body = {
      rutaRepo: this.rutaRepo,
      rama: rama
    }
    this.electronService.invoke("git-checkout", body)
      .then((response: {ok: boolean, mensajes: string[]}) => {
        if(response.ok){
          this.ramaActual = rama;
        }
        response.mensajes.forEach(mensaje => {
          this.terminal.agregarMensaje(mensaje)
        })
      });
  };

  observarRamaGit(): void {
    const puerto = this.puerto;
    const ruta = this.rutaRepo;    
    this.electronService.send("observar-rama-git", {puerto, ruta})
    this.electronService.on(`respuesta-observar-rama-git-${puerto}`, (event: any, response: {ruta: string, nombre: string}) => {  
      this.ngZone.run(() => {
        this.setRamaActual(response.nombre);
      });
    });
  }

  removeListeners(): void {
    this.electronService.removeAllListeners(`respuesta-observar-rama-git-${this.puerto}`)
  }

  tareasPeriodicas = () => {
    this.consultarRamas();
    this.verificarSiLaRamaActualEstaDesactualizada();
  }

  consultarRamas(): void {
    const rutaRepo = this.rutaRepo;
    this.electronService.invoke("consultar-ramas-git", rutaRepo)
      .then((ramas: string[]) => {
        this.ramasDisponibles = ramas;
      });
  }

  verificarSiLaRamaActualEstaDesactualizada(): void {
    const rutaRepo = this.rutaRepo;
    this.electronService.invoke("consultar-rama-desactualizada", rutaRepo)
      .then((estaDesactualizada: boolean) => {
        this.ramaDesactualizada = estaDesactualizada;
      });
  }

  gitPull(): void {
    const rutaRepo = this.rutaRepo;
    this.electronService.invoke("git-pull", rutaRepo)
      .then((response: {ok: boolean, mensajes: string[]}) => {
        if(response.ok){
          this.ramaDesactualizada = false;
        }
        response.mensajes.forEach(mensaje => {
          this.terminal.agregarMensaje(mensaje);
        })
      });
  }

}