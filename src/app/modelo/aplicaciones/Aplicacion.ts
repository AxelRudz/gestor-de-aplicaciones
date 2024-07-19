import { Estado } from "./Estado";
import { Git } from "./Git";
import { Terminal } from "./Terminal";
import { ElectronService } from "src/app/services/electron.service";
import { AplicacionService } from "src/app/services/aplicacion.service";

export abstract class Aplicacion {

  private nombre: string;
  private puerto: number;
  private ruta: string;
  private git: Git;
  private estado: Estado;
  private terminal: Terminal;
  protected electronService: ElectronService;  
  protected aplicacionService: AplicacionService;

  constructor(
    nombre: string,
    puerto: number,
    ruta: string,
    electronService: ElectronService,
    aplicacionService: AplicacionService,
  ){
    this.nombre = nombre;
    this.puerto = puerto;
    this.ruta = ruta;
    this.estado = new Estado();
    this.terminal = new Terminal();    
    this.git = new Git(ruta, puerto, electronService, this.terminal);
    this.electronService = electronService;
    this.aplicacionService = aplicacionService;
  }

  abstract getLogoUrl(): string;
  abstract iniciar(): void;
  abstract detener(): Promise<boolean>;

  eliminar(): void {
    this.detener()
    .then(ok => {
      if(ok){
        this.aplicacionService.eliminarAplicacion(this.getPuerto());
        this.getGit().removeListeners();
      }
    })    
  }

  getNombre(): string {
    return this.nombre;
  }

  setNombre(nombre: string): void {
    this.nombre = nombre;
  }

  getPuerto(): number {
    return this.puerto;
  }

  setPuerto(puerto: number): void {
    this.puerto = puerto;
  }

  getRuta(): string {
    return this.ruta;
  }

  setRuta(ruta: string): void {
    this.ruta = ruta;
  }

  getGit(): Git{
    return this.git;
  }

  getEstado(): Estado {
    return this.estado;
  }

  getTerminal(): Terminal {
    return this.terminal;
  }

}