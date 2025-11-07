import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/token.js";
import { UserRepository } from "../repositories/user.repository.js";

const userRepo = new UserRepository();

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
      ? header.slice(7)
      : (req.query.token as string);
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Token nao informado" });
    }
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res
        .status(401)
        .json({ success: false, message: "Token invalido" });
    }
    const user = await userRepo.findById(payload.sub);
    if (!user || user.isActive === false) {
      return res
        .status(401)
        .json({ success: false, message: "Usuario nao encontrado" });
    }
    req.user = {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({
        success: false,
        message: error instanceof Error ? error.message : "Token invalido",
      });
  }
}

export function authorizeAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user || req.user.role !== "admin") {
    return res
      .status(403)
      .json({ success: false, message: "Permissao negada" });
  }
  return next();
}
