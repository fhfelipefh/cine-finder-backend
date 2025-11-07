import type { Request, Response } from "express";
import { z } from "zod";
import {
  createCommentSchema,
  getByImdbSchema,
  idParamSchema,
  updateCommentSchema,
} from "../models/comment.model.js";
import { CommentService } from "../services/comment.service.js";

export class CommentController {
  private readonly service = new CommentService();

  private ensureUser(req: Request) {
    if (!req.user) {
      throw new Error("Usuario nao autenticado");
    }
    return req.user;
  }

  private handleError(res: Response, error: unknown, status = 400) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Dados invalidos",
        errors: error.issues,
      });
    }
    const message = error instanceof Error ? error.message : "Erro interno";
    const httpStatus =
      message.includes("nao encontrado") || message.includes("inexistente")
        ? 404
        : status;
    return res.status(httpStatus).json({ success: false, message });
  }

  async listByImdb(req: Request, res: Response) {
    try {
      const { imdbId } = getByImdbSchema.parse(req.params);
      const page = Number.isNaN(Number(req.query.page))
        ? 1
        : Math.max(1, Number(req.query.page ?? 1));
      const pageSize = Number.isNaN(Number(req.query.pageSize))
        ? 20
        : Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
      const result = await this.service.listByImdb(imdbId, page, pageSize);
      res.json({ success: true, data: result });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const payload = createCommentSchema.parse(req.body);
      const created = await this.service.create(user, payload);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = idParamSchema.parse(req.params);
      const payload = updateCommentSchema.parse(req.body);
      const updated = await this.service.update(user, id, payload);
      res.json({ success: true, data: updated });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = idParamSchema.parse(req.params);
      await this.service.remove(user, id);
      res.json({ success: true, message: "Comentario removido" });
    } catch (error) {
      return this.handleError(res, error, 403);
    }
  }
}
