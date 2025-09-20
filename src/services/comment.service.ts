import crypto from 'node:crypto';
import { CommentRepository } from '../repositories/comment.repository.js';
import type { CreateCommentInput, UpdateCommentInput } from '../models/comment.model.js';
import { hasProfanity } from '../utils/profanity.js';

function getIpHash(ip: string, salt?: string) {
  const h = crypto.createHash('sha256');
  h.update(ip + (salt ?? ''));
  return h.digest('hex');
}

export class CommentService {
  private repo: CommentRepository;
  private windowMs = 10 * 60 * 1000;

  constructor() {
    this.repo = new CommentRepository();
  }

  async listByImdb(imdbId: string, page = 1, pageSize = 20) {
    return this.repo.listByImdb(imdbId, page, pageSize);
  }

  async create(ip: string, payload: CreateCommentInput) {
    if (hasProfanity(payload.author) || hasProfanity(payload.comment)) {
      throw new Error('Conteúdo impróprio detectado');
    }
    
    const ipHash = getIpHash(ip, process.env.IP_HASH_SALT);
    return this.repo.create({ ...payload, ipHash });
  }

  async canMutate(ip: string, commentCreatedAt: Date) {
    const now = Date.now();
    const created = commentCreatedAt.getTime();
    return now - created <= this.windowMs;
  }

  async update(ip: string, id: number, data: UpdateCommentInput) {
    if ((data.author && hasProfanity(data.author)) || (data.comment && hasProfanity(data.comment))) {
      throw new Error('Conteúdo impróprio detectado');
    }
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error('Comentário não encontrado');
    const ipHash = getIpHash(ip, process.env.IP_HASH_SALT);
    if (existing.ipHash !== ipHash) throw new Error('Permissão negada');
    const allowed = await this.canMutate(ip, existing.createdAt);
    if (!allowed) throw new Error('Janela de edição/remoção expirada');
    return this.repo.update(id, data);
  }

  async remove(ip: string, id: number) {
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error('Comentário não encontrado');
    const ipHash = getIpHash(ip, process.env.IP_HASH_SALT);
    if (existing.ipHash !== ipHash) throw new Error('Permissão negada');
    const allowed = await this.canMutate(ip, existing.createdAt);
    if (!allowed) throw new Error('Janela de edição/remoção expirada');
    return this.repo.delete(id);
  }
}
