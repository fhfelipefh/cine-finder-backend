import type { Request, Response } from "express";
import { z } from "zod";
import {
  favoriteParamSchema,
  favoritePayloadSchema,
} from "../models/favorite.model.js";
import { FavoriteService } from "../services/favorite.service.js";

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

export class FavoriteController {
  private readonly service = new FavoriteService();

  private ensureUser(req: Request) {
    if (!req.user) throw new Error("Usuario nao autenticado");
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

  async list(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const query = paginationQuery.parse(req.query);
      const data = await this.service.list(
        user,
        query.page ?? 1,
        query.pageSize ?? 20
      );
      res.json({ success: true, data });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async add(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const payload = favoritePayloadSchema.parse(req.body);
      const favorite = await this.service.add(user, payload);
      res.status(201).json({ success: true, data: favorite });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { imdbId } = favoriteParamSchema.parse(req.params);
      const body = favoritePayloadSchema.parse({
        imdbId,
        notes: req.body?.notes,
      });
      const favorite = await this.service.update(user, imdbId, body.notes);
      res.json({ success: true, data: favorite });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { imdbId } = favoriteParamSchema.parse(req.params);
      await this.service.remove(user, imdbId);
      res.json({ success: true, message: "Favorito removido" });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
