import { Schema, model } from "mongoose";
import { ICriteria } from "../types";

const criteriaSchema = new Schema<ICriteria>(
  {
    torneoId: { type: Schema.Types.ObjectId, ref: "Torneo", required: true },
    nombre: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["checkbox", "manual"], default: "checkbox" },
    puntos: { type: Number, default: 0, min: 0 },
    puntosMaximos: { type: Number, min: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

criteriaSchema.index({ torneoId: 1 });

export default model<ICriteria>("Criteria", criteriaSchema);
