import { Schema, model } from "mongoose";
import { ITorneo } from "../types";

const torneoSchema = new Schema<ITorneo>(
  {
    nombre: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<ITorneo>("Torneo", torneoSchema);
