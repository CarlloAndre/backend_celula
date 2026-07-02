import { Request, Response } from "express";
import Week from "../models/Week";

// GET /api/weeks  -> lista todas las semanas (más reciente primero)
export const getWeeks = async (req: Request, res: Response): Promise<void> => {
  try {
    const weeks = await Week.find().sort({ numero: -1 });
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener semanas.", error });
  }
};

// POST /api/weeks  (crear nueva semana/turno - solo admin)
export const createWeek = async (req: Request, res: Response): Promise<void> => {
  try {
    const { etiqueta, fechaInicio, fechaFin } = req.body;

    if (!etiqueta || !fechaInicio || !fechaFin) {
      res.status(400).json({
        message: "Etiqueta, fecha de inicio y fecha de fin son requeridas.",
      });
      return;
    }

    // El número de semana se calcula automáticamente (autoincremental)
    const ultimaSemana = await Week.findOne().sort({ numero: -1 });
    const numero = ultimaSemana ? ultimaSemana.numero + 1 : 1;

    const week = await Week.create({ numero, etiqueta, fechaInicio, fechaFin });
    res.status(201).json(week);
  } catch (error) {
    res.status(500).json({ message: "Error al crear semana.", error });
  }
};

// DELETE /api/weeks/:id  (solo admin, por si se crea una de más)
export const deleteWeek = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await Week.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ message: "Semana no encontrada." });
      return;
    }

    res.json({ message: "Semana eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar semana.", error });
  }
};
