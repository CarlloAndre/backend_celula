import { Document, Types } from "mongoose";

// ---------- Admin / Usuario principal ----------
export interface IAdmin extends Document {
  username: string;
  password: string;
  comparePassword(candidate: string): Promise<boolean>;
}

// ---------- Criterio (ej: "Trajo Biblia", "Asistencia", "Versículo") ----------
export type TipoCriterio = "checkbox" | "manual";

export interface ICriteria extends Document {
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
  nombre: string;
  foto?: string;
  puntosTotales: number;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---------- Semana / Turno ----------
export interface IWeek extends Document {
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
  weekId: Types.ObjectId;
  participantId: Types.ObjectId;
  checks: ICheckItem[];
  puntosGanados: number;
  createdAt: Date;
  updatedAt: Date;
}
