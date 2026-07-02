// Script para crear el admin inicial desde la terminal.
// Uso: npm run seed -- usuario contraseña
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin";

dotenv.config();

const run = async (): Promise<void> => {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.log("Uso: npm run seed -- <usuario> <contraseña>");
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/torneo";
  await mongoose.connect(uri);

  const existing = await Admin.findOne({ username });
  if (existing) {
    console.log(`⚠️  El usuario "${username}" ya existe.`);
    process.exit(0);
  }

  await Admin.create({ username, password });
  console.log(`✅ Admin "${username}" creado correctamente.`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
