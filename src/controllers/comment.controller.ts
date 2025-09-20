import type { Request, Response } from 'express';
import { CommentService } from '../services/comment.service.js';
import { createCommentSchema, updateCommentSchema, idParamSchema, getByImdbSchema } from '../models/comment.model.js';
import { z } from 'zod';

export class CommentController {
  private service = new CommentService();

  private getIp(req: Request): string {
    const xfwdRaw = req.headers['x-forwarded-for'] as string | string[] | undefined;
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

  private handleError(res: Response, error: unknown, opts?: { allowProfanity?: boolean; invalidParamsMessage?: string }) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: opts?.invalidParamsMessage ?? 'Dados inválidos', errors: error.issues });
    }
    if (error instanceof Error) {
      const msg = error.message;
      if (msg === 'Comentário não encontrado') return res.status(404).json({ success: false, message: msg });
      if (msg === 'Permissão negada' || msg.includes('Janela')) return res.status(403).json({ success: false, message: msg });
      if (opts?.allowProfanity && msg.includes('Conteúdo impróprio')) return res.status(400).json({ success: false, message: msg });
    }
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Erro interno' });
  }

  async listByImdb(req: Request, res: Response) {
    try {
      const { imdbId } = getByImdbSchema.parse(req.params);
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
      const result = await this.service.listByImdb(imdbId, page, pageSize);
      res.json({ success: true, data: result });
    } catch (error) {
      return this.handleError(res, error, { invalidParamsMessage: 'Parâmetros inválidos' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const ip = this.getIp(req);
      const payload = createCommentSchema.parse(req.body);
      const created = await this.service.create(ip, payload);
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      return this.handleError(res, error, { allowProfanity: true });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const ip = this.getIp(req);
      const { id } = idParamSchema.parse(req.params);
      const payload = updateCommentSchema.parse(req.body);
      const updated = await this.service.update(ip, id, payload);
      res.json({ success: true, data: updated });
    } catch (error) {
      return this.handleError(res, error, { allowProfanity: true });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const ip = this.getIp(req);
      const { id } = idParamSchema.parse(req.params);
      await this.service.remove(ip, id);
      res.json({ success: true, message: 'Comentário removido' });
    } catch (error) {
      return this.handleError(res, error);
    }
  }
}
