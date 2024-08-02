import { TipoAplicacion } from "src/app/modelo/aplicaciones/enums/TipoAplicacion";

// Basado en el archivo Aplicacion de electron/modelo/Aplicacion.js
export interface AplicacionElectronDTO {
  id: number;
  tipo: TipoAplicacion;
  nombre: string;
  ruta: string;
  puerto: number;
  urlTableroTrello: string | null;
  comandoDeArranque: string;
}