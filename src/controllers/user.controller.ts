import type { Request, Response } from "express";
import { z } from "zod";
import {
  changePasswordSchema,
  updateProfileSchema,
  userIdParamSchema,
} from "../models/user.model.js";
import { UserService } from "../services/user.service.js";

export class UserController {
  private readonly service = new UserService();

  private ensureUser(req: Request) {
    if (!req.user) {
      throw new Error("Usuario nao autenticado");
    }
    return req.user;
  }

  private handleError(res: Response, error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados invalidos",
        errors: error.issues,
      });
    }
    const message = error instanceof Error ? error.message : "Erro interno";
    const status = message.includes("nao encontrado") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }

  async getMe(req: Request, res: Response) {
    try {
      const current = this.ensureUser(req);
      const user = await this.service.getProfile(current.id);
      res.json({ success: true, data: user });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const current = this.ensureUser(req);
      const payload = updateProfileSchema.parse(req.body);
      const user = await this.service.updateProfile(current.id, payload);
      res.json({ success: true, data: user });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const current = this.ensureUser(req);
      const payload = changePasswordSchema.parse(req.body);
      const user = await this.service.changePassword(current.id, payload);
      res.json({ success: true, data: user });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async deleteMe(req: Request, res: Response) {
    try {
      const current = this.ensureUser(req);
      await this.service.deleteAccount(current.id);
      res.json({ success: true, message: "Conta removida" });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      this.ensureUser(req);
      const { id } = userIdParamSchema.parse(req.params);
      await this.service.deleteUserByAdmin(id);
      res.json({ success: true, message: "Usuario removido" });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
