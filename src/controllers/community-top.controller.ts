import type { Request, Response } from "express";
import { z } from "zod";
import { updateCommunityTopSchema } from "../models/community-top.model.js";
import { CommunityTopService } from "../services/community-top.service.js";

export class CommunityTopController {
  private readonly service = new CommunityTopService();

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
    return res.status(400).json({ success: false, message });
  }

  async list(req: Request, res: Response) {
    try {
      const includeVotes = req.user?.role === "admin";
      const limitRaw = Number(req.query.limit);
      const limit =
        !Number.isNaN(limitRaw) && limitRaw > 0
          ? Math.min(50, Math.max(1, Math.floor(limitRaw)))
          : 10;
      const data = await this.service.getList({ includeVotes, limit });
      res.json({ success: true, data });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const payload = updateCommunityTopSchema.parse(req.body);
      const updated = await this.service.updateList(user.id, payload);
      res.json({ success: true, data: updated });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
