export interface Reporte {
  id: number;
  fechaHora: string;
  lugar: string;
  descripcionHecho: string;
  tipoFalta: 'TIPO_I' | 'TIPO_II' | 'TIPO_III';
  estado: 'PENDIENTE' | 'FIRMADO';
  firmadoPor?: string;
  entidadSalud?: EntidadSalud;
  policia?: Policia;
  implicados?: Implicado[];
  latitud?: number;
  longitud?: number;
}
export interface Implicado {
  id: number;
  rol: 'VICTIMA' | 'AGRESOR' | 'TESTIGO';
  estudiante?: Estudiante;
  acudiente?: Acudiente;
}
export interface Estudiante {
  id: number;
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  genero?: string;
  grado?: string;
  jornada?: string;
  sede?: string;
  paisOrigen?: string;
  departamentoExpedicion?: string;
  municipioExpedicion?: string;
  grupoEtnico?: string;
  tipoDiscapacidad?: string;
  victimaConflicto?: boolean;
  promedioAcademico?: number;
  numeroInasistencias?: number;
  colegio?: Colegio;
  acudiente?: Acudiente;
}
export interface Acudiente {
  id: number;
  nombreCompleto: string;
  telefono: string;
  email: string;
  notificado: boolean;
}
export interface EntidadSalud { id: number; nombre: string; telefono: string; direccion: string; }
export interface Policia { id: number; nombre: string; estacion: string; telefonoEmergencia: string; }
export interface Colegio { id: number; nombre: string; sede: string; nit: string; }
export interface Estadisticas { totalReportes: number; porTipo: Record<string,number>; porGrado: Record<string,number>; }
export interface SiuceFormato {
  fechaReporte: string; lugar: string; descripcion: string; tipoFalta: string;
  victimas: {nombre:string;grado:string}[];
  agresores: {nombre:string;grado:string}[];
  testigos: {nombre:string;grado:string}[];
  medidasCautelares: string[];
  firmadoPor: string;
}
export interface Usuario {
  token: string;
  rol: string;
  username: string;
  nombreCompleto: string;
  misReportes?: any[];
  reportesAcudidos?: any[];
}