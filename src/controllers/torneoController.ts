import { Request, Response } from "express";
import Torneo from "../models/Torneo";

// GET /api/torneos  -> lista pública, para la pantalla de selección inicial
export const getTorneos = async (req: Request, res: Response): Promise<void> => {
  try {
    const torneos = await Torneo.find({ activo: true }).sort({ createdAt: 1 });
    res.json(torneos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener torneos.", error });
  }
};

// GET /api/torneos/:slug -> obtener un torneo por su slug (para resolver la URL)
export const getTorneoBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const torneo = await Torneo.findOne({ slug, activo: true });

    if (!torneo) {
      res.status(404).json({ message: "Torneo no encontrado." });
      return;
    }

    res.json(torneo);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el torneo.", error });
  }
};

// POST /api/torneos  (crear torneo nuevo - operación manual de mantenimiento)
export const createTorneo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, slug } = req.body;

    if (!nombre || !slug) {
      res.status(400).json({ message: "Nombre y slug son requeridos." });
      return;
    }

    const torneo = await Torneo.create({ nombre, slug });
    res.status(201).json(torneo);
  } catch (error) {
    res.status(500).json({ message: "Error al crear torneo.", error });
  }
};
