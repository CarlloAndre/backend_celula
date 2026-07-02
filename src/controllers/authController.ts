import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin";

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Usuario y contraseña son requeridos." });
      return;
    }

    const admin = await Admin.findOne({ username });
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

    const token = jwt.sign({ adminId: admin._id }, secret, {
      expiresIn,
    } as jwt.SignOptions);

    res.json({
      token,
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    res.status(500).json({ message: "Error en el servidor.", error });
  }
};
//hola amigos del señor como estas, toy probando el guihut
// POST /api/auth/register  (crear el admin inicial; se puede deshabilitar luego)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ message: "Usuario y contraseña son requeridos." });
      return;
    }

    const existing = await Admin.findOne({ username });
    if (existing) {
      res.status(409).json({ message: "Ese usuario ya existe." });
      return;
    }

    const admin = await Admin.create({ username, password });
    res.status(201).json({
      message: "Admin creado correctamente.",
      admin: { id: admin._id, username: admin.username },
    });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor.", error });
  }
};