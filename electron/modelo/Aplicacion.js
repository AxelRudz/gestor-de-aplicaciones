class Aplicacion {
  constructor(tipo, nombre, ruta, puerto, comandoIniciar){
    this.tipo = tipo;
    this.nombre = nombre;
    this.ruta = ruta;
    this.puerto = puerto;
    this.comandoIniciar = comandoIniciar;
  }
}

module.exports = {
  Aplicacion
}