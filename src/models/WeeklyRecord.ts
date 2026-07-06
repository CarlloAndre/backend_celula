import { Schema, model } from "mongoose";
import { IWeeklyRecord } from "../types";

const checkItemSchema = new Schema(
  {
    criteriaId: { type: Schema.Types.ObjectId, ref: "Criteria", required: true },
    marcado: { type: Boolean, default: false },
    valor: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const weeklyRecordSchema = new Schema<IWeeklyRecord>(
  {
    torneoId: { type: Schema.Types.ObjectId, ref: "Torneo", required: true },
    weekId: { type: Schema.Types.ObjectId, ref: "Week", required: true },
    participantId: { type: Schema.Types.ObjectId, ref: "Participant", required: true },
    checks: { type: [checkItemSchema], default: [] },
    puntosGanados: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Un participante solo puede tener UN registro por semana (evita duplicados)
weeklyRecordSchema.index({ weekId: 1, participantId: 1 }, { unique: true });

export default model<IWeeklyRecord>("WeeklyRecord", weeklyRecordSchema);
