class Aplicacion {
  constructor(tipo, nombre, ruta, puerto, comandoDeArranque){
    this.tipo = tipo;
    this.nombre = nombre;
    this.ruta = ruta;
    this.puerto = puerto;
    this.comandoDeArranque = comandoDeArranque;
  }
}

module.exports = {
  Aplicacion
}