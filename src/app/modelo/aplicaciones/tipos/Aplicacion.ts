import { Git } from "../Git";
import { Terminal } from "../Terminal";
import { ElectronService } from "src/app/services/electron.service";
import { AplicacionService } from "src/app/services/aplicacion.service";
import { TipoAplicacion } from "src/app/modelo/aplicaciones/enums/TipoAplicacion";


// Nota: Las clases que heredan de Aplicacion deben implementar un metodo statico donde
// devuelven el comando de arranque por defecto para iniciar la aplicacion de su clase
export abstract class Aplicacion {

  private nombre: string;
  private puerto: number;
  private ruta: string;
  private urlTableroTrello: string | null;
  private comandoDeArranque: string;
  private git: Git;
  private terminal: Terminal;
  private pidProceso: number | null;
  protected electronService: ElectronService;  
  protected aplicacionService: AplicacionService;

  constructor(
    nombre: string,
    puerto: number,
    ruta: string,
    urlTableroTrello: string | null,
    comandoDeArranque: string,
    electronService: ElectronService,
    aplicacionService: AplicacionService,
  ){
    this.nombre = nombre;
    this.puerto = puerto;
    this.ruta = ruta;
    this.urlTableroTrello = urlTableroTrello;
    this.comandoDeArranque = comandoDeArranque;
    this.pidProceso = null;
    this.terminal = new Terminal();    
    this.git = new Git(ruta, puerto, electronService, this.terminal);
    this.electronService = electronService;
    this.aplicacionService = aplicacionService;

    // Suscripcion que usa el iniciar
    this.electronService.on(`iniciar-aplicacion-${this.puerto}`, (event: any, pid: number | null, mensaje: string) => {
      this.pidProceso = pid;
      this.terminal.agregarMensaje(mensaje)
      if(pid == null){
        this.puedeIniciarLaApp = true;
      }
    });
  }

  private puedeIniciarLaApp = true;
  
  abstract getTipoAplicacion(): TipoAplicacion;
  abstract getLogoUrl(): string;

  iniciar(): void {
    if(!this.pidProceso && this.puedeIniciarLaApp){
      this.puedeIniciarLaApp = false;
      this.terminal.setMensajes([`Iniciando aplicación...`])
      this.electronService.send("iniciar-aplicacion", this.puerto, this.ruta, this.comandoDeArranque);
    }
  }

  async detener(): Promise<boolean> {
    this.terminal.agregarMensaje("Deteniendo aplicación...");
    try {
      const ok = await this.electronService.invoke("detener-aplicacion", this.pidProceso)
      if(ok){
        this.pidProceso = null;
        this.puedeIniciarLaApp = true;
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

  estaEnEjecucion(): boolean {
    return this.pidProceso != null;
  }
  
  eliminar(): void {
    this.detener()
      .then(ok => {
        if(ok){
          this.aplicacionService.eliminarAplicacion(this);
        }
      })
      .catch(error => console.error("Hubo un error deteniendo la app. Error: ", error));
  }

  abrirEnIDE(): void {
    this.terminal.agregarMensaje(`Abriendo ${this.nombre} en Visual Studio Code...`);
    this.electronService.invoke("abrir-aplicacion-en-visual-studio", this.ruta)
    .then( ok => {
      if(ok){
        this.terminal.agregarMensaje("Acción finalizada.");
      }
    })
    .catch(error => {
      console.error("Ocurrió un error abriendo la aplicación en Visual Studio Code. Error: ", error)
    });
  }

  abrirEnNavegador(): void {
    this.terminal.agregarMensaje(`Abriendo ${this.nombre} en el navegador...`);
    this.electronService.invoke("abrir-en-navegador", this.puerto)
    .then( ok => {
      if(ok){
        this.terminal.agregarMensaje("Acción finalizada.");
      }
    })
    .catch(error => {
      console.error("Ocurrió un error abriendo la aplicación en el navegador. Error: ", error)
    });
  }

  abrirTableroDeTrello(): void {
    this.terminal.agregarMensaje(`Abriendo tablero de ${this.nombre} en el navegador...`);
    this.electronService.invoke("abrir-tablero-de-trello", this.urlTableroTrello)
    .then( ok => {
      if(ok){
        this.terminal.agregarMensaje("Acción finalizada.");
      }
    })
    .catch(error => {
      console.error("Ocurrió un error abriendo la app en Visual Studio Code. Error: ", error)
    });
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

  getComandoDeArranque(): string {
    return this.comandoDeArranque;
  }

  setComandoDeArranque(comandoDeArranque: string): void {
    this.comandoDeArranque = comandoDeArranque;
  }

  getUrlTableroTrello(): string | null {
    return this.urlTableroTrello;
  }

  setUrlTableroTrello(urlTableroTrello: string | null): void {
    this.urlTableroTrello = urlTableroTrello;
  }

}