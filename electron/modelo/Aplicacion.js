class Aplicacion {
  constructor(id, tipo, nombre, ruta, puerto, comandoDeArranque){
    this.id = id;
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