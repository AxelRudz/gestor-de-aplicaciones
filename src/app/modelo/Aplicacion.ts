export interface AppInfoRamasGit {
  ramas: string[],
  tieneCambios: boolean
}

export abstract class Aplicacion {

  private nombre: string;
  private puerto: number;
  private ruta: string;
  private enEjecucion: boolean;
  private terminal: string;
  private nombreRamaGit: string;
  private infoRamas: AppInfoRamasGit | null;

  constructor(nombre: string, puerto: number, ruta: string){
    this.nombre = nombre;
    this.puerto = puerto;
    this.ruta = ruta;
    this.enEjecucion = false;
    this.terminal = "";
    this.nombreRamaGit = "No disponible";
    this.infoRamas = null;
  }

  abstract getUrlLogo(): string;

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

  estaEnEjecucion(): boolean {
    return this.enEjecucion;
  }

  setEnEjecucion(enEjecucion: boolean): void {
    this.enEjecucion = enEjecucion;
  }

  agregarMensajeTerminal(mensaje: string): void {
    this.terminal = this.terminal + "\n" + mensaje;
  }

  getTerminal(): string {
    return this.terminal;
  }

  setTerminal(mensaje: string){
    this.terminal = mensaje;
  }

  getRamaGit(): string {
    return this.nombreRamaGit;
  }

  setNombreRamaGit(nombre: string): void {
    this.nombreRamaGit = nombre;
  }

  getInfoRamas(): AppInfoRamasGit | null {
    return this.infoRamas;
  }

  setInfoRamas(info: AppInfoRamasGit | null){
    this.infoRamas = info;
  }



}