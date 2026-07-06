import { Request, Response } from "express";
import WeeklyRecord from "../models/WeeklyRecord";
import Criteria from "../models/Criteria";
import Participant from "../models/Participant";
import { IWeeklyRecord, ICriteria } from "../types";
import { AuthRequest } from "../middleware/auth";

// Recalcula los puntos totales de un participante sumando TODOS sus registros semanales.
// Se llama cada vez que se guarda/edita un registro, así el total siempre queda exacto
// incluso si el admin corrige una semana pasada.
// (No hace falta filtrar por torneo aquí: un participantId ya pertenece a un solo torneo.)
const recalcularPuntosTotales = async (participantId: string): Promise<void> => {
  const records = await WeeklyRecord.find({ participantId });
  const total = records.reduce(
    (sum: number, r: IWeeklyRecord) => sum + r.puntosGanados,
    0
  );
  await Participant.findByIdAndUpdate(participantId, { puntosTotales: total });
};

// GET /api/weekly-records?weekId=...&torneoId=...  -> todos los registros de una semana (con detalle)
export const getRecordsByWeek = async (req: Request, res: Response): Promise<void> => {
  try {
    const { weekId, torneoId } = req.query;

    if (!weekId || !torneoId) {
      res.status(400).json({ message: "Se requiere weekId y torneoId." });
      return;
    }

    const records = await WeeklyRecord.find({ weekId, torneoId })
      .populate("participantId", "nombre foto activo")
      .populate("checks.criteriaId", "nombre puntos tipo puntosMaximos");

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener registros.", error });
  }
};

// GET /api/weekly-records/participant/:participantId -> historial completo de un participante
export const getRecordsByParticipant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { participantId } = req.params;

    const records = await WeeklyRecord.find({ participantId })
      .populate("weekId", "numero etiqueta fechaInicio fechaFin")
      .populate("checks.criteriaId", "nombre puntos tipo puntosMaximos")
      .sort({ createdAt: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener historial.", error });
  }
};

// POST /api/weekly-records  (crear o actualizar el registro de un participante en una semana)
// Body: { torneoId, weekId, participantId, checks: [{ criteriaId, marcado }] }
// Es "upsert": si ya existe el registro para esa semana+participante, lo actualiza (siempre editable).
export const saveRecord = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { torneoId, weekId, participantId, checks } = req.body;

    if (!torneoId || !weekId || !participantId || !Array.isArray(checks)) {
      res.status(400).json({
        message: "torneoId, weekId, participantId y checks (array) son requeridos.",
      });
      return;
    }

    if (torneoId !== req.adminTorneoId) {
      res.status(403).json({ message: "No tienes acceso a este torneo." });
      return;
    }

    // Calculamos los puntos según los criterios marcados/ingresados
    const criteriaIds = checks.map((c: { criteriaId: string }) => c.criteriaId);
    const criteriaDocs = await Criteria.find({ _id: { $in: criteriaIds } });

    let puntosGanados = 0;
    const checksNormalizados = checks.map(
      (check: { criteriaId: string; marcado?: boolean; valor?: number }) => {
        const criterio = criteriaDocs.find(
          (c: ICriteria) => c._id.toString() === check.criteriaId
        );

        if (criterio?.tipo === "manual") {
          const max = criterio.puntosMaximos ?? 0;
          let valor = Number(check.valor) || 0;
          if (valor < 0) valor = 0;
          if (valor > max) valor = max;
          puntosGanados += valor;
          return { criteriaId: check.criteriaId, marcado: valor > 0, valor };
        }

        const marcado = !!check.marcado;
        if (marcado && criterio) puntosGanados += criterio.puntos;
        return { criteriaId: check.criteriaId, marcado, valor: 0 };
      }
    );

    const record = await WeeklyRecord.findOneAndUpdate(
      { weekId, participantId },
      { torneoId, weekId, participantId, checks: checksNormalizados, puntosGanados },
      { new: true, upsert: true, runValidators: true }
    );

    // Mantenemos el total del participante siempre sincronizado
    await recalcularPuntosTotales(participantId);

    const populated = await WeeklyRecord.findById(record._id)
      .populate("checks.criteriaId", "nombre puntos tipo puntosMaximos")
      .populate("participantId", "nombre foto");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Error al guardar registro.", error });
  }
};

// GET /api/weekly-records/leaderboard?torneoId=... -> Top de participantes ordenado por puntos
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId } = req.query;

    if (!torneoId) {
      res.status(400).json({ message: "Se requiere torneoId." });
      return;
    }

    const top = await Participant.find({ torneoId, activo: true }).sort({
      puntosTotales: -1,
    });
    res.json(top);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el top.", error });
  }
};
