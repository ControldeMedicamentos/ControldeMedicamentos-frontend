export interface Rol {
  id: number;
  name: string;
  descripcion?: string;
  esSistema: boolean;
}

export interface RolVistaPermiso {
  vistaId: number;
  codigo: string;
  nombre: string;
  ruta: string;
  grupo: string;
  leer: boolean;
  escribir: boolean;
  modificar: boolean;
  eliminar: boolean;
}
