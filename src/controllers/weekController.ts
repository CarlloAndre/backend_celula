import { Request, Response } from "express";
import Week from "../models/Week";
import { AuthRequest } from "../middleware/auth";

// GET /api/weeks?torneoId=...  -> lista todas las semanas de un torneo (más reciente primero)
export const getWeeks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId } = req.query;

    if (!torneoId) {
      res.status(400).json({ message: "Se requiere torneoId." });
      return;
    }

    const weeks = await Week.find({ torneoId }).sort({ numero: -1 });
    res.json(weeks);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener semanas.", error });
  }
};

// POST /api/weeks  (crear nueva semana/turno - solo admin)
export const createWeek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { torneoId, etiqueta, fechaInicio, fechaFin } = req.body;

    if (!torneoId) {
      res.status(400).json({ message: "Se requiere torneoId." });
      return;
    }

    if (torneoId !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    if (!etiqueta || !fechaInicio || !fechaFin) {
      res.status(400).json({
        message: "Etiqueta, fecha de inicio y fecha de fin son requeridas.",
      });
      return;
    }

    // El número de semana se calcula automáticamente (autoincremental por torneo)
    const ultimaSemana = await Week.findOne({ torneoId }).sort({ numero: -1 });
    const numero = ultimaSemana ? ultimaSemana.numero + 1 : 1;

    const week = await Week.create({ torneoId, numero, etiqueta, fechaInicio, fechaFin });
    res.status(201).json(week);
  } catch (error) {
    res.status(500).json({ message: "Error al crear semana.", error });
  }
};

// PUT /api/weeks/:id  (editar semana - solo admin)
export const updateWeek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { etiqueta, fechaInicio, fechaFin } = req.body;

    const existente = await Week.findById(id);
    if (!existente) {
      res.status(404).json({ message: "Semana no encontrada." });
      return;
    }
    if (existente.torneoId.toString() !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    const cambios: Record<string, unknown> = {};
    if (etiqueta !== undefined) cambios.etiqueta = etiqueta;
    if (fechaInicio !== undefined) cambios.fechaInicio = fechaInicio;
    if (fechaFin !== undefined) cambios.fechaFin = fechaFin;

    const week = await Week.findByIdAndUpdate(id, cambios, {
      new: true,
      runValidators: true,
    });

    res.json(week);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar semana.", error });
  }
};

// DELETE /api/weeks/:id  (solo admin, por si se crea una de más)
export const deleteWeek = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existente = await Week.findById(id);
    if (!existente) {
      res.status(404).json({ message: "Semana no encontrada." });
      return;
    }
    if (existente.torneoId.toString() !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    await Week.findByIdAndDelete(id);
    res.json({ message: "Semana eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar semana.", error });
  }
};
