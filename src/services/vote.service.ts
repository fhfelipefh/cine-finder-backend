import crypto from 'node:crypto';
import { VoteRepository } from '../repositories/vote.repository.js';

function getIpHash(ip: string, salt?: string) {
  const h = crypto.createHash('sha256');
  h.update(ip + (salt ?? ''));
  return h.digest('hex');
}

export class VoteService {
  private readonly repo = new VoteRepository();

  async upsert(ip: string, imdbId: string, rating: number) {
    const ipHash = getIpHash(ip, process.env.IP_HASH_SALT);
    return this.repo.upsertVote({ imdbId, ipHash, rating });
  }

  async listMine(ip: string, page = 1, pageSize = 20) {
    const ipHash = getIpHash(ip, process.env.IP_HASH_SALT);
    return this.repo.listMyVotes(ipHash, page, pageSize);
  }

  async getById(ip: string, id: string) {
    const ipHash = getIpHash(ip, process.env.IP_HASH_SALT);
    const doc = await this.repo.getById(id);
    if (!doc) throw new Error('Voto não encontrado');
    if (doc.ipHash !== ipHash) throw new Error('Permissão negada');
    return doc;
  }

  async updateById(ip: string, id: string, rating: number) {
    const current = await this.getById(ip, id);
    return this.repo.upsertVote({ imdbId: current.imdbId, ipHash: current.ipHash, rating });
  }

  async remove(ip: string, id: string) {
  const myVotes = await this.listMine(ip, 1, 1_000);
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
