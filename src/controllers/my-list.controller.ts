import type { Request, Response } from "express";
import { z } from "zod";
import {
  createMyListSchema,
  myListIdParamSchema,
  myListQuerySchema,
  updateMyListSchema,
} from "../models/my-list.model.js";
import { MyListService } from "../services/my-list.service.js";

export class MyListController {
  private readonly service = new MyListService();

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
    const status =
      message.includes("nao encontrada") || message.includes("nao encontrado")
        ? 404
        : 400;
    return res.status(status).json({ success: false, message });
  }

  async list(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const filters = myListQuerySchema.parse(req.query);
      const result = await this.service.list(user.id, filters);
      res.json({ success: true, data: result });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async stats(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const result = await this.service.stats(user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async getOne(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = myListIdParamSchema.parse(req.params);
      const entry = await this.service.getById(user.id, id);
      res.json({ success: true, data: entry });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async createOrUpdate(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const payload = createMyListSchema.parse(req.body);
      const result = await this.service.upsert(user, payload);
      res
        .status(result.created ? 201 : 200)
        .json({ success: true, data: result.entry, created: result.created });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = myListIdParamSchema.parse(req.params);
      const payload = updateMyListSchema.parse(req.body);
      const updated = await this.service.update(user.id, id, payload);
      res.json({ success: true, data: updated });
    } catch (error) {
      return this.handleError(res, error);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const user = this.ensureUser(req);
      const { id } = myListIdParamSchema.parse(req.params);
      await this.service.remove(user.id, id);
      res.json({ success: true, message: "Entrada removida" });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
