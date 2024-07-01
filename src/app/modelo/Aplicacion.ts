export abstract class Aplicacion {

  private nombre: string;
  private puerto: number;
  private ruta: string;
  private enEjecucion: boolean;

  constructor(nombre: string, puerto: number, ruta: string){
    this.nombre = nombre;
    this.puerto = puerto;
    this.ruta = ruta;
    this.enEjecucion = false;
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

}