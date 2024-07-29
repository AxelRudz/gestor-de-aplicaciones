import { ElectronService } from "src/app/services/electron.service";
import { Terminal } from "./Terminal";

export class Git {
  
  private rutaRepo: string;
  private puerto: number;
  private ramaActual: string;
  private ramasDisponibles: string[];
  private ramaActualizada: boolean;
  private electronService: ElectronService;  
  private terminal: Terminal;

  constructor(rutaRepo: string, puerto: number, electronService: ElectronService, terminal: Terminal){
    this.rutaRepo = rutaRepo;
    this.puerto = puerto;
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

  escucharCambiosRamaActual(): void {
    this.electronService.send("rama-actual", this.rutaRepo, this.puerto);
    this.electronService.on(`rama-actual-${this.puerto}`, (event: any, nombre: string) => {        
      this.ramaActual = nombre;
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

  removeListeners(): void {
    this.electronService.removeAllListeners(`rama-actual-${this.puerto}`);
  }

  async iniciarTareasAutomaticas(): Promise<void> {
    this.escucharCambiosRamaActual();
    while (true) {
      await this.consultarRamasDisponibles();
      await this.consultarRamaActualizada();
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

}