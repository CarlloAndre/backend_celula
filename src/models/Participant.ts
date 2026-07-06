import { Schema, model } from "mongoose";
import { IParticipant } from "../types";

const participantSchema = new Schema<IParticipant>(
  {
    torneoId: { type: Schema.Types.ObjectId, ref: "Torneo", required: true },
    nombre: { type: String, required: true, trim: true },
    foto: { type: String, default: "" },
    puntosTotales: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

participantSchema.index({ torneoId: 1 });

export default model<IParticipant>("Participant", participantSchema);
