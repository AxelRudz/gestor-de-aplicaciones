import { ElectronService } from "src/app/services/electron.service";
import { Terminal } from "./Terminal";

export class Git {
  
  private rutaRepo: string;
  private ramaActual: string;
  private ramasDisponibles: string[];
  private ramaActualizada: boolean;
  private electronService: ElectronService;  
  private terminal: Terminal;

  constructor(rutaRepo: string, electronService: ElectronService, terminal: Terminal){
    this.rutaRepo = rutaRepo;
    this.ramaActual = "";
    this.ramasDisponibles = [];
    this.ramaActualizada = true;
    this.electronService = electronService;  
    this.terminal = terminal;
    this.iniciarTareasAutomaticas();
  }

  getRamaActual(): string {
    return this.ramaActual;
  }

  getRamasDisponibles(): string[] {
    return this.ramasDisponibles;
  }

  getRamaActualizada(): boolean {
    return this.ramaActualizada;
  }

  gitCheckout(rama: string): void {
    this.electronService.invoke("git-checkout", this.rutaRepo, rama)
      .then((response: {ok: boolean, mensajes: string[]}) => {
        if(response.ok){
          this.ramaActual = rama;
        }
        response.mensajes.forEach(mensaje => {
          this.terminal.agregarMensaje(mensaje)
        })
      });
  };

  gitPull(): void {    
    this.electronService.invoke("git-pull", this.rutaRepo)
      .then((response: {ok: boolean, mensajes: string[]}) => {
        if(response.ok){
          this.ramaActualizada = true;
        }
        response.mensajes.forEach(mensaje => {
          this.terminal.agregarMensaje(mensaje);
        })
      });
  }

  consultarRamaActual(): Promise<any> {
    return this.electronService.invoke("rama-actual", this.rutaRepo)
      .then((ramaActual: string) => {
        this.ramaActual = ramaActual;
      });    
  }

  consultarRamasDisponibles(): Promise<any> {
    return this.electronService.invoke("ramas-disponibles", this.rutaRepo)
      .then((ramasDisponibles: string[]) => {
        this.ramasDisponibles = ramasDisponibles;
      });
  }

  consultarRamaActualizada(): Promise<any> {
    return this.electronService.invoke("rama-actualizada", this.rutaRepo)
      .then((ramaActualizada: boolean) => {
        this.ramaActualizada = ramaActualizada;
      });
  }

  async iniciarTareasAutomaticas(): Promise<void> {
    while (true) {
      await this.consultarRamaActual();
      await this.consultarRamasDisponibles();
      await this.consultarRamaActualizada();
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

}