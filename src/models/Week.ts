import { Schema, model } from "mongoose";
import { IWeek } from "../types";

const weekSchema = new Schema<IWeek>(
  {
    torneoId: { type: Schema.Types.ObjectId, ref: "Torneo", required: true },
    numero: { type: Number, required: true },
    etiqueta: { type: String, required: true, trim: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

weekSchema.index({ torneoId: 1 });

export default model<IWeek>("Week", weekSchema);
