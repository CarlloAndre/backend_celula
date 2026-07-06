import { Document, Types } from "mongoose";

// ---------- Torneo (contenedor raíz: cada torneo es independiente) ----------
export interface ITorneo extends Document {
  nombre: string;
  slug: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Admin / Usuario principal ----------
export interface IAdmin extends Document {
  torneoId: Types.ObjectId;
  username: string;
  password: string;
  comparePassword(candidate: string): Promise<boolean>;
}

// ---------- Criterio (ej: "Trajo Biblia", "Asistencia", "Versículo") ----------
export type TipoCriterio = "checkbox" | "manual";

export interface ICriteria extends Document {
  torneoId: Types.ObjectId;
  nombre: string;
  tipo: TipoCriterio;
  puntos: number; // usado cuando tipo = "checkbox" (puntaje fijo)
  puntosMaximos?: number; // usado cuando tipo = "manual" (tope del puntaje)
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Participante del torneo ----------
export interface IParticipant extends Document {
  torneoId: Types.ObjectId;
  nombre: string;
  foto?: string;
  puntosTotales: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Semana / Turno ----------
export interface IWeek extends Document {
  torneoId: Types.ObjectId;
  numero: number;
  etiqueta: string; // ej: "Semana 1" o "22 jun - 28 jun"
  fechaInicio: Date;
  fechaFin: Date;
  createdAt: Date;
}

// ---------- Check individual dentro de un registro semanal ----------
export interface ICheckItem {
  criteriaId: Types.ObjectId;
  marcado: boolean; // usado cuando el criterio es tipo "checkbox"
  valor: number; // usado cuando el criterio es tipo "manual"
}

// ---------- Registro semanal de un participante (los checkboxes) ----------
export interface IWeeklyRecord extends Document {
  torneoId: Types.ObjectId;
  weekId: Types.ObjectId;
  participantId: Types.ObjectId;
  checks: ICheckItem[];
  puntosGanados: number;
  createdAt: Date;
  updatedAt: Date;
}
