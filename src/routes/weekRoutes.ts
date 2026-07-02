import { Router } from "express";
import { getWeeks, createWeek, deleteWeek } from "../controllers/weekController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getWeeks); // público: para navegar el historial
router.post("/", requireAuth, createWeek);
router.delete("/:id", requireAuth, deleteWeek);

export default router;
