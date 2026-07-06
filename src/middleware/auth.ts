import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  adminId?: string;
  adminTorneoId?: string;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No autorizado. Token no proporcionado." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_SECRET as string;
    const decoded = jwt.verify(token, secret) as {
      adminId: string;
      torneoId: string;
    };
    req.adminId = decoded.adminId;
    req.adminTorneoId = decoded.torneoId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado." });
  }
};

// Además de estar logueado, el admin solo puede operar sobre el torneo
// al que pertenece su token. El torneoId de la request (query o body)
// debe coincidir con el del token.
export const requireSameTorneo = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const torneoId = (req.query.torneoId as string) || req.body?.torneoId;

  if (!torneoId) {
    res.status(400).json({ message: "Se requiere torneoId." });
    return;
  }

  if (torneoId !== req.adminTorneoId) {
    res.status(403).json({ message: "No tienes acceso a este torneo." });
    return;
  }

  next();
};
