import crypto from 'node:crypto';
import { VoteRepository } from '../repositories/vote.repository.js';

function getIpHash(ip: string, salt?: string) {
  const h = crypto.createHash('sha256');
  h.update(ip + (salt ?? ''));
  return h.digest('hex');
}

export class VoteService {
  private readonly repo = new VoteRepository();

  private identityFrom(ip: string, uuid?: string) {
    const basis = (uuid && uuid.trim().length > 0) ? `uuid:${uuid.trim()}` : `ip:${ip}`;
    const ipHash = getIpHash(basis, process.env.IP_HASH_SALT);
    const identityType: 'ip' | 'uuid' = (uuid && uuid.trim().length > 0) ? 'uuid' : 'ip';
    return { ipHash, identityType } as const;
  }

  async upsert(ip: string, imdbId: string, rating: number, uuid?: string) {
    const id = this.identityFrom(ip, uuid);
    return this.repo.upsertVote({ imdbId, ipHash: id.ipHash, rating, identityType: id.identityType });
  }

  async listMine(ip: string, page = 1, pageSize = 20, uuid?: string) {
    const id = this.identityFrom(ip, uuid);
    return this.repo.listMyVotes(id.ipHash, page, pageSize);
  }

  async getById(ip: string, id: string, uuid?: string) {
    const ident = this.identityFrom(ip, uuid);
    const doc = await this.repo.getById(id);
    if (!doc) throw new Error('Voto não encontrado');
    if (doc.ipHash !== ident.ipHash) throw new Error('Permissão negada');
    return doc;
  }

  async updateById(ip: string, id: string, rating: number, uuid?: string) {
    const current = await this.getById(ip, id, uuid);
    return this.repo.upsertVote({ imdbId: current.imdbId, ipHash: current.ipHash, rating, identityType: current.identityType });
  }

  async remove(ip: string, id: string, uuid?: string) {
  const myVotes = await this.listMine(ip, 1, 1_000, uuid);
  const found = myVotes.items.find((v: any) => v.id === id);
    if (!found) throw new Error('Permissão negada');
    return this.repo.delete(id);
  }

  async getRanking(limit = 50) {
    return this.repo.getRanking({ limit });
  }

  async getMovieRanking(imdbId: string) {
  const list = await this.repo.getRanking({ imdbId, limit: 1_000 });
  const item = list.find((i: any) => i.imdbId === imdbId);
    return item ?? { imdbId, avgRating: 0, votes: 0, lastVoteAt: null };
  }
}
