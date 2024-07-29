import { Git } from "./Git";
import { Terminal } from "./Terminal";
import { ElectronService } from "src/app/services/electron.service";
import { AplicacionService } from "src/app/services/aplicacion.service";
import { TipoAplicacion } from "./AplicacionPersistenciaDTO";

export abstract class Aplicacion {

  private nombre: string;
  private puerto: number;
  private ruta: string;
  private comandoIniciar: string;
  private git: Git;
  private terminal: Terminal;
  private pidProceso: number | null;
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
    // La clase hija tendrá definido un comando para iniciar la app
    this.comandoIniciar = this.getComandoIniciar();
    this.pidProceso = null;
    this.terminal = new Terminal();    
    this.git = new Git(ruta, puerto, electronService, this.terminal);
    this.electronService = electronService;
    this.aplicacionService = aplicacionService;
  }
  
  abstract getLogoUrl(): string;
  abstract getComandoIniciar(): string;
  abstract getTipoAplicacion(): TipoAplicacion;

  iniciar(): void {
    this.terminal.setMensajes([`Iniciando aplicación...`])
    this.electronService.send("iniciar-aplicacion", this.puerto, this.ruta, this.comandoIniciar);
    this.electronService.on(`iniciar-aplicacion-${this.puerto}`, (event: any, pid: number | null, mensaje: string) => {
      this.pidProceso = pid;
      this.terminal.agregarMensaje(mensaje)
    });
  }

  async detener(): Promise<boolean> {
    this.terminal.agregarMensaje("Deteniendo aplicación...");
    try {
      const ok = await this.electronService.invoke("detener-aplicacion", this.pidProceso)
      if(ok){
        this.pidProceso = null;
        this.terminal.agregarMensaje("Aplicación detenida.");
        return true;
      }
    }
    catch(error){
      console.error("Error deteniendo la aplicación. Error: ", error);
    }
    this.terminal.agregarMensaje("Error deteniendo la aplicación.");
    return false;
  }
  
  eliminar(): void {
    this.detener()
      .then(ok => {
        if(ok){
          this.getGit().removeListeners();
          this.aplicacionService.eliminarAplicacion(this);
        }
      })
      .catch(error => console.error("Hubo un error deteniendo la app. Error: ", error));
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

  getPidProceso(): number | null {
    return this.pidProceso;
  }

  getTerminal(): Terminal {
    return this.terminal;
  }

  setComandoIniciar(comandoIniciar: string): void {
    this.comandoIniciar = comandoIniciar;
  }


}