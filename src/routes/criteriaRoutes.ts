import { Router } from "express";
import {
  getCriteria,
  createCriteria,
  updateCriteria,
  deleteCriteria,
} from "../controllers/criteriaController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", getCriteria); // público: para mostrar qué se evalúa
router.post("/", requireAuth, createCriteria);
router.put("/:id", requireAuth, updateCriteria);
router.delete("/:id", requireAuth, deleteCriteria);

export default router;
