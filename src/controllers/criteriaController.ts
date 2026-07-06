import { Request, Response } from "express";
import Criteria from "../models/Criteria";
import { AuthRequest } from "../middleware/auth";

// GET /api/criteria?torneoId=...  (todos, o solo activos con ?activo=true)
export const getCriteria = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId } = req.query;

    if (!torneoId) {
      res.status(400).json({ message: "Se requiere torneoId." });
      return;
    }

    const filter: Record<string, unknown> = { torneoId };
    if (req.query.activo === "true") filter.activo = true;

    const criteria = await Criteria.find(filter).sort({ createdAt: 1 });
    res.json(criteria);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener criterios.", error });
  }
};

// POST /api/criteria  (crear nuevo criterio - solo admin)
export const createCriteria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { torneoId, nombre, tipo, puntos, puntosMaximos } = req.body;

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

    const tipoFinal = tipo === "manual" ? "manual" : "checkbox";

    if (tipoFinal === "checkbox" && (puntos === undefined || puntos === null)) {
      res.status(400).json({ message: "Los puntos son requeridos para un criterio de tipo Checkbox." });
      return;
    }

    if (tipoFinal === "manual" && (puntosMaximos === undefined || puntosMaximos === null)) {
      res.status(400).json({ message: "El puntaje máximo es requerido para un criterio de tipo Puntaje Manual." });
      return;
    }

    const criteria = await Criteria.create({
      torneoId,
      nombre,
      tipo: tipoFinal,
      puntos: tipoFinal === "checkbox" ? puntos : 0,
      puntosMaximos: tipoFinal === "manual" ? puntosMaximos : undefined,
    });
    res.status(201).json(criteria);
  } catch (error) {
    res.status(500).json({ message: "Error al crear criterio.", error });
  }
};

// PUT /api/criteria/:id  (editar criterio - solo admin)
export const updateCriteria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { nombre, tipo, puntos, puntosMaximos, activo } = req.body;

    const existente = await Criteria.findById(id);
    if (!existente) {
      res.status(404).json({ message: "Criterio no encontrado." });
      return;
    }
    if (existente.torneoId.toString() !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    const cambios: Record<string, unknown> = { nombre, activo };
    if (tipo !== undefined) cambios.tipo = tipo;
    if (puntos !== undefined) cambios.puntos = puntos;
    if (puntosMaximos !== undefined) cambios.puntosMaximos = puntosMaximos;

    const criteria = await Criteria.findByIdAndUpdate(id, cambios, {
      new: true,
      runValidators: true,
    });

    res.json(criteria);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar criterio.", error });
  }
};

// DELETE /api/criteria/:id  (eliminar criterio - solo admin)
export const deleteCriteria = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existente = await Criteria.findById(id);
    if (!existente) {
      res.status(404).json({ message: "Criterio no encontrado." });
      return;
    }
    if (existente.torneoId.toString() !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    await Criteria.findByIdAndDelete(id);
    res.json({ message: "Criterio eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar criterio.", error });
  }
};
