import type { Request, Response } from "express";
import { z } from "zod";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../models/movie.model.js";
import { MovieService } from "../services/movie.service.js";

const paginationQuery = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional(),
});

const imdbParam = z.object({
  imdbId: z.string().min(1).max(30),
});

const idParam = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "id invalido"),
});

export class MovieController {
  private readonly service = new MovieService();

  private getUserId(req: Request) {
    if (!req.user) throw new Error("Usuario nao autenticado");
    return req.user.id;
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
      const query = paginationQuery.parse(req.query);
      const data = await this.service.list(query.page, query.pageSize);
      res.json({ success: true, data });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = this.getUserId(req);
      const payload = createMovieSchema.parse(req.body);
      const movie = await this.service.create(userId, payload);
      res.status(201).json({ success: true, data: movie });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getByImdb(req: Request, res: Response) {
    try {
      const { imdbId } = imdbParam.parse(req.params);
      const movie = await this.service.getByImdbId(imdbId);
      res.json({ success: true, data: movie });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = idParam.parse(req.params);
      const payload = updateMovieSchema.parse(req.body);
      const movie = await this.service.update(id, payload);
      res.json({ success: true, data: movie });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = idParam.parse(req.params);
      await this.service.delete(id);
      res.json({ success: true, message: "Filme removido" });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
