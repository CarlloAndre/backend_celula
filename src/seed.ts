// Script para crear torneos y su admin inicial desde la terminal.
//
// Uso:
//   npm run seed -- <slug-torneo> <nombre-torneo> <usuario-admin> <contraseña-admin>
//
// Ejemplos:
//   npm run seed -- torneo-a "Torneo Célula A" admin_a claveSegura1
//   npm run seed -- torneo-b "Torneo Célula B" admin_b claveSegura2
//
// Si el torneo (por slug) ya existe, no se vuelve a crear; solo se crea el admin.
import dotenv from "dotenv";
import mongoose from "mongoose";
import Admin from "./models/Admin";
import Torneo from "./models/Torneo";

dotenv.config();

const run = async (): Promise<void> => {
  const [slug, nombre, username, password] = process.argv.slice(2);

  if (!slug || !nombre || !username || !password) {
    console.log(
      "Uso: npm run seed -- <slug-torneo> <nombre-torneo> <usuario-admin> <contraseña-admin>"
    );
    process.exit(1);
  }

  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/torneo";
  await mongoose.connect(uri);

  let torneo = await Torneo.findOne({ slug });
  if (!torneo) {
    torneo = await Torneo.create({ nombre, slug });
    console.log(`✅ Torneo "${nombre}" (${slug}) creado correctamente.`);
  } else {
    console.log(`ℹ️  El torneo "${slug}" ya existía, se reutiliza.`);
  }

  const existingAdmin = await Admin.findOne({ torneoId: torneo._id, username });
  if (existingAdmin) {
    console.log(`⚠️  El usuario "${username}" ya existe en el torneo "${slug}".`);
    process.exit(0);
  }

  await Admin.create({ torneoId: torneo._id, username, password });
  console.log(`✅ Admin "${username}" creado correctamente para el torneo "${slug}".`);
  process.exit(0);
};

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
