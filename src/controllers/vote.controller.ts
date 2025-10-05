import type { Request, Response } from 'express';
import { z } from 'zod';
import { VoteService } from '../services/vote.service.js';
import { upsertVoteSchema } from '../models/comment.model.js';

const idParam = z.object({ id: z.string().regex(/^[a-f\d]{24}$/i) });
const imdbParam = z.object({ imdbId: z.string().min(1).max(30) });

export class VoteController {
  private readonly service = new VoteService();

  private getIp(req: Request): string {
    const xfwdRaw = req.headers['x-forwarded-for'];
    let candidate = '';
    if (typeof xfwdRaw === 'string' && xfwdRaw.length > 0) {
      candidate = (xfwdRaw.split(',')[0] ?? '').trim();
    } else if (Array.isArray(xfwdRaw) && xfwdRaw.length > 0) {
      candidate = xfwdRaw[0] ?? '';
    }
    if (candidate) return candidate;
    const ip = req.ip ?? '';
    if (ip) return ip;
    const ra = req.socket?.remoteAddress ?? '';
    return ra;
  }

  private handleError(res: Response, error: unknown) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Dados inválidos', errors: error.issues });
    }
    if (error instanceof Error) {
      const msg = error.message;
      if (msg.includes('Permissão')) return res.status(403).json({ success: false, message: msg });
      if (msg.includes('não encontrado')) return res.status(404).json({ success: false, message: msg });
      return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: 'Erro interno' });
  }

  async upsert(req: Request, res: Response) {
    try {
      const { imdbId, rating } = upsertVoteSchema.parse(req.body);
      const ip = this.getIp(req);
      const clientUuid = (req.headers['x-client-uuid'] as string) || (req.query.uuid as string) || (req.body?.uuid as string);
      const doc = await this.service.upsert(ip, imdbId, rating, clientUuid);
      res.status(201).json({ success: true, data: doc });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  async listMine(req: Request, res: Response) {
    try {
      const ip = this.getIp(req);
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
      const clientUuid = (req.headers['x-client-uuid'] as string) || (req.query.uuid as string);
      const result = await this.service.listMine(ip, page, pageSize, clientUuid);
      res.json({ success: true, data: result });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = idParam.parse(req.params);
      const ip = this.getIp(req);
      const clientUuid = (req.headers['x-client-uuid'] as string) || (req.query.uuid as string);
      await this.service.remove(ip, id, clientUuid);
      res.json({ success: true, message: 'Voto removido' });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = idParam.parse(req.params);
      const ip = this.getIp(req);
      const clientUuid = (req.headers['x-client-uuid'] as string) || (req.query.uuid as string);
      const doc = await this.service.getById(ip, id, clientUuid);
      res.json({ success: true, data: doc });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  async updateById(req: Request, res: Response) {
    try {
      const { id } = idParam.parse(req.params);
      const body = z.object({ rating: z.number().int().min(1).max(10) }).parse(req.body);
      const ip = this.getIp(req);
      const clientUuid = (req.headers['x-client-uuid'] as string) || (req.query.uuid as string) || (req.body?.uuid as string);
      const doc = await this.service.updateById(ip, id, body.rating, clientUuid);
      res.json({ success: true, data: doc });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  async ranking(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Math.min(200, Math.max(1, Number(req.query.limit))) : 50;
      const list = await this.service.getRanking(limit);
      res.json({ success: true, data: list });
    } catch (err) {
      return this.handleError(res, err);
    }
  }

  async movieRanking(req: Request, res: Response) {
    try {
      const { imdbId } = imdbParam.parse(req.params);
      const item = await this.service.getMovieRanking(imdbId);
      res.json({ success: true, data: item });
    } catch (err) {
      return this.handleError(res, err);
    }
  }
}
