import { Schema, model } from "mongoose";
import { IWeek } from "../types";

const weekSchema = new Schema<IWeek>(
  {
    numero: { type: Number, required: true },
    etiqueta: { type: String, required: true, trim: true },
    fechaInicio: { type: Date, required: true },
    fechaFin: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IWeek>("Week", weekSchema);
