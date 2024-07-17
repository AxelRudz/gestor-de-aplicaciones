export class Git {
  
  private ramaActual: string = "";
  private ramasDisponibles: string[] = [];
  private ramaDesactualizada: boolean = false;

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

  };
}