export interface RespuestaSteam {
  fechaDia: string;
  horaConsulta: string;
  desdeCache: boolean;
  salio: boolean;
  mensaje: string;
  loQueSiHayEnSteam: { id: number; nombre: string }[];
  totalConsultas: number;
}

export interface NoticiaHL3 {
  titulo: string;
  link: string;
  fuente: string;
  fecha: string;
}

export interface Plegaria {
  id: number;
  autor: string;
  mensaje: string;
  fecha: string;
  amenes?: number;
  ipAutor?: string;
  ipsAmen?: string[];
}
