import { Router } from "express";
import {
  getParticipants,
  createParticipant,
  updateParticipant,
  deleteParticipant,
} from "../controllers/participantController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getParticipants); // público: para el top
router.post("/", requireAuth, createParticipant);
router.put("/:id", requireAuth, updateParticipant);
router.delete("/:id", requireAuth, deleteParticipant);

export default router;
