import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import { IAdmin } from "../types";

const adminSchema = new Schema<IAdmin>(
  {
    torneoId: { type: Schema.Types.ObjectId, ref: "Torneo", required: true },
    username: { type: String, required: true, trim: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// El username solo debe ser único DENTRO de cada torneo (no globalmente),
// así dos torneos pueden tener un admin con el mismo username si quisieran.
adminSchema.index({ torneoId: 1, username: 1 }, { unique: true });

// Hashear contraseña antes de guardar
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Método para comparar contraseñas en el login
adminSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export default model<IAdmin>("Admin", adminSchema);
