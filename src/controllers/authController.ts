import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";
import Torneo from "../models/Torneo";

// POST /api/auth/login
// Body: { torneoId, username, password }
// El admin de un torneo NO puede loguearse en otro torneo: buscamos
// siempre por username + torneoId juntos.
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId, username, password } = req.body;

    if (!torneoId || !username || !password) {
      res
        .status(400)
        .json({ message: "torneoId, usuario y contraseña son requeridos." });
      return;
    }

    const admin = await Admin.findOne({ torneoId, username });
    if (!admin) {
      res.status(401).json({ message: "Credenciales inválidas." });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Credenciales inválidas." });
      return;
    }

    const secret = process.env.JWT_SECRET as string;
    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

    const token = jwt.sign(
      { adminId: admin._id, torneoId: admin.torneoId },
      secret,
      { expiresIn } as jwt.SignOptions
    );

    res.json({
      token,
      admin: { id: admin._id, username: admin.username, torneoId: admin.torneoId },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor.", error });
  }
};

// POST /api/auth/register  (crear el admin inicial de un torneo)
// Body: { torneoId, username, password }
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { torneoId, username, password } = req.body;

    if (!torneoId || !username || !password) {
      res
        .status(400)
        .json({ message: "torneoId, usuario y contraseña son requeridos." });
      return;
    }

    const torneo = await Torneo.findById(torneoId);
    if (!torneo) {
      res.status(404).json({ message: "El torneo indicado no existe." });
      return;
    }

    const existing = await Admin.findOne({ torneoId, username });
    if (existing) {
      res.status(409).json({ message: "Ese usuario ya existe en este torneo." });
      return;
    }

    const admin = await Admin.create({ torneoId, username, password });
    res.status(201).json({
      message: "Admin creado correctamente.",
      admin: { id: admin._id, username: admin.username, torneoId: admin.torneoId },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor.", error });
  }
};
