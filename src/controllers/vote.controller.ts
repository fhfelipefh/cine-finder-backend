import type { Request, Response } from "express";
import { z } from "zod";
import { VoteService } from "../services/vote.service.js";
import { upsertVoteSchema, voteIdParamSchema } from "../models/vote.model.js";

const imdbParam = z.object({ imdbId: z.string().min(1).max(30) });

export class VoteController {
  private readonly service = new VoteService();

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
    const status = message.includes("Permissao") ? 403 : message.includes("nao encontrado") ? 404 : 400;
    return res.status(status).json({ success: false, message });
  }

  async upsert(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { imdbId, rating } = upsertVoteSchema.parse(req.body);
      const doc = await this.service.upsert(user, imdbId, rating);
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async listMine(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const page = Number.isNaN(Number(req.query.page))
        ? 1
        : Math.max(1, Number(req.query.page ?? 1));
      const pageSize = Number.isNaN(Number(req.query.pageSize))
        ? 20
        : Math.min(100, Math.max(1, Number(req.query.pageSize ?? 20)));
      const result = await this.service.listMine(user, page, pageSize);
      res.json({ success: true, data: result });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = voteIdParamSchema.parse(req.params);
      await this.service.remove(user, id);
      res.json({ success: true, message: "Voto removido" });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = voteIdParamSchema.parse(req.params);
      const doc = await this.service.getById(user, id);
      res.json({ success: true, data: doc });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async updateById(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = voteIdParamSchema.parse(req.params);
      const body = z.object({ rating: z.number().int().min(1).max(10) }).parse(req.body);
      const doc = await this.service.updateById(user, id, body.rating);
      res.json({ success: true, data: doc });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async ranking(req: Request, res: Response) {
    try {
      const limit = req.query.limit
        ? Math.min(200, Math.max(1, Number(req.query.limit)))
        : 50;
      const list = await this.service.getRanking(limit);
      res.json({ success: true, data: list });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async movieRanking(req: Request, res: Response) {
    try {
      const { imdbId } = imdbParam.parse(req.params);
      const item = await this.service.getMovieRanking(imdbId);
      res.json({ success: true, data: item });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
