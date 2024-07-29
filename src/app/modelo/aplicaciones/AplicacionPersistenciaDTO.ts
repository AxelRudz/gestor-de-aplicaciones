// Basado en el archivo Aplicacion de electron/modelo/Aplicacion.js

export enum TipoAplicacion {
  Angular = "Angular",
  SpringBoot = "SpringBoot",
  Otra = "Otra"
}

export interface AplicacionPersistenciaDTO {
  tipo: TipoAplicacion;
  nombre: string;
  ruta: string;
  puerto: number;
  comandoIniciar: string;
}