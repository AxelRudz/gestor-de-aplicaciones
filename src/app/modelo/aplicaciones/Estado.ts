export class Estado {
  
  private numPid: number | null = null;
  private enEjecucion: boolean = false;

  getNumPid(): number | null {
    return this.numPid;
  }

  setNumPid(numPid: number | null): void {
    this.numPid = numPid;
  }

  estaEnEjecucion(): boolean {
    return this.enEjecucion;
  }

  setEnEjecucion(enEjecucion: boolean): void {
    this.enEjecucion = enEjecucion;
  }
}