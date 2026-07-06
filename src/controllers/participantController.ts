import { Request, Response } from "express";
import Participant from "../models/Participant";
import { AuthRequest } from "../middleware/auth";

// GET /api/participants?torneoId=...  -> lista (también sirve como base del "Top")
// Público: solo activos. Admin (?todos=true): activos e inactivos.
export const getParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId } = req.query;

    if (!torneoId) {
      res.status(400).json({ message: "Se requiere torneoId." });
      return;
    }

    const soloActivos = req.query.todos !== "true";
    const filter = soloActivos ? { torneoId, activo: true } : { torneoId };
    const participants = await Participant.find(filter).sort({
      puntosTotales: -1,
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener participantes.", error });
  }
};

// POST /api/participants  (crear participante - solo admin)
export const createParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { torneoId, nombre, foto } = req.body;

    if (!torneoId) {
      res.status(400).json({ message: "Se requiere torneoId." });
      return;
    }

    if (torneoId !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    if (!nombre) {
      res.status(400).json({ message: "El nombre es requerido." });
      return;
    }

    const participant = await Participant.create({ torneoId, nombre, foto });
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ message: "Error al crear participante.", error });
  }
};

// PUT /api/participants/:id  (editar participante - solo admin)
export const updateParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, foto, activo } = req.body;

    const existente = await Participant.findById(id);
    if (!existente) {
      res.status(404).json({ message: "Participante no encontrado." });
      return;
    }
    if (existente.torneoId.toString() !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    const participant = await Participant.findByIdAndUpdate(
      id,
      { nombre, foto, activo },
      { new: true, runValidators: true }
    );

    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar participante.", error });
  }
};

// DELETE /api/participants/:id  (solo admin)
export const deleteParticipant = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existente = await Participant.findById(id);
    if (!existente) {
      res.status(404).json({ message: "Participante no encontrado." });
      return;
    }
    if (existente.torneoId.toString() !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    await Participant.findByIdAndDelete(id);
    res.json({ message: "Participante eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar participante.", error });
  }
};
