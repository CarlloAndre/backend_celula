import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";

import authRoutes from "./routes/authRoutes";
import criteriaRoutes from "./routes/criteriaRoutes";
import participantRoutes from "./routes/participantRoutes";
import weekRoutes from "./routes/weekRoutes";
import weeklyRecordRoutes from "./routes/weeklyRecordRoutes";
import torneoRoutes from "./routes/torneoRoutes";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/torneos", torneoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/criteria", criteriaRoutes);
app.use("/api/participants", participantRoutes);
app.use("/api/weeks", weekRoutes);
app.use("/api/weekly-records", weeklyRecordRoutes);

app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", message: "API del Torneo funcionando 🚀" });
});

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  });
};

startServer();
