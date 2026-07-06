import { Router } from "express";
import { getTorneos, getTorneoBySlug, createTorneo } from "../controllers/torneoController";

const router = Router();

router.get("/", getTorneos); // público: pantalla de selección inicial
router.get("/:slug", getTorneoBySlug); // público: resolver /torneo/:slug
router.post("/", createTorneo); // mantenimiento manual (crear un torneo nuevo)

export default router;
