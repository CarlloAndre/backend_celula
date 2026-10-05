import { Router } from "express";
import {
  getRecordsByWeek,
  getRecordsByParticipant,
  saveRecord,
  getLeaderboard,
  deleteAllRecords,
} from "../controllers/weeklyRecordController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/leaderboard", getLeaderboard); // público: el Top
router.get("/", getRecordsByWeek); // público: ver detalle de una semana
router.get("/participant/:participantId", getRecordsByParticipant); // público: historial
router.post("/", requireAuth, saveRecord); // solo admin: marcar checkboxes
router.delete("/all", requireAuth, deleteAllRecords); // solo admin: borrar TODOS los puntos del torneo

export default router;
 