import type { Request, Response } from "express";
import { z } from "zod";
import {
  loginSchema,
  registerUserSchema,
} from "../models/user.model.js";
import { AuthService } from "../services/auth.service.js";

export class AuthController {
  private readonly service = new AuthService();

  private handleError(res: Response, error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados invalidos",
        errors: error.issues,
      });
    }
    const message =
      error instanceof Error ? error.message : "Erro inesperado";
    const status =
      message.includes("Credenciais") || message.includes("Email")
        ? 400
        : 500;
    return res.status(status).json({ success: false, message });
  }

  async register(req: Request, res: Response) {
    try {
      const payload = registerUserSchema.parse(req.body);
      const { user, token } = await this.service.register(payload);
      res.status(201).json({ success: true, data: { user, token } });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const payload = loginSchema.parse(req.body);
      const { user, token } = await this.service.login(payload);
      res.json({ success: true, data: { user, token } });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
