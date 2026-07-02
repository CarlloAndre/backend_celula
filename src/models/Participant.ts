import { Schema, model } from "mongoose";
import { IParticipant } from "../types";

const participantSchema = new Schema<IParticipant>(
  {
    nombre: { type: String, required: true, trim: true },
    foto: { type: String, default: "" },
    puntosTotales: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default model<IParticipant>("Participant", participantSchema);
