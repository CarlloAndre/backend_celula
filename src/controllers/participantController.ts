import { Request, Response } from "express";
import Participant from "../models/Participant";

// GET /api/participants  -> lista (también sirve como base del "Top")
// Público: solo activos. Admin (?todos=true): activos e inactivos.
export const getParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const soloActivos = req.query.todos !== "true";
    const filter = soloActivos ? { activo: true } : {};
    const participants = await Participant.find(filter).sort({
      puntosTotales: -1,
    });
    res.json(participants);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener participantes.", error });
  }
};

// POST /api/participants  (crear participante - solo admin)
export const createParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, foto } = req.body;

    if (!nombre) {
      res.status(400).json({ message: "El nombre es requerido." });
      return;
    }

    const participant = await Participant.create({ nombre, foto });
    res.status(201).json(participant);
  } catch (error) {
    res.status(500).json({ message: "Error al crear participante.", error });
  }
};

// PUT /api/participants/:id  (editar participante - solo admin)
export const updateParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, foto, activo } = req.body;

    const participant = await Participant.findByIdAndUpdate(
      id,
      { nombre, foto, activo },
      { new: true, runValidators: true }
    );

    if (!participant) {
      res.status(404).json({ message: "Participante no encontrado." });
      return;
    }

    res.json(participant);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar participante.", error });
  }
};

// DELETE /api/participants/:id  (solo admin)
export const deleteParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Participant.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Participante no encontrado." });
      return;
    }

    res.json({ message: "Participante eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar participante.", error });
  }
};