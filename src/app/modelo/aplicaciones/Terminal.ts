export class Terminal {

  private mensajes: string[] = [];

  getMensajes(): string[] {
    return this.mensajes;
  }

  setMensajes(mensajes: string[]): void {
    this.mensajes = mensajes;
  }

  agregarMensaje(mensaje: string): void {
    this.mensajes.push(mensaje);
  }
}