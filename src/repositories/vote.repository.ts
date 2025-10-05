import mongoose, { type PipelineStage } from 'mongoose';
import { getVoteModel } from '../config/database.js';

export class VoteRepository {
  async upsertVote(data: { imdbId: string; ipHash: string; rating: number; identityType?: 'ip' | 'uuid' }) {
    const Vote = getVoteModel();
    const doc = await Vote.findOneAndUpdate(
      { imdbId: data.imdbId, ipHash: data.ipHash },
      { $set: { rating: data.rating, identityType: data.identityType ?? 'ip' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean({ virtuals: true });
    return doc;
  }

  async listMyVotes(ipHash: string, page = 1, pageSize = 20) {
    const Vote = getVoteModel();
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      Vote.find({ ipHash }).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean({ virtuals: true }),
      Vote.countDocuments({ ipHash }),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const Vote = getVoteModel();
    if (!mongoose.isValidObjectId(id)) return null;
    return Vote.findById(id).lean({ virtuals: true });
  }

  async delete(id: string) {
    const Vote = getVoteModel();
    if (!mongoose.isValidObjectId(id)) throw new Error('Voto não encontrado');
    await Vote.findByIdAndDelete(id);
    return { success: true } as const;
  }

  async getRanking({ imdbId, limit = 50 }: { imdbId?: string; limit?: number }) {
    const Vote = getVoteModel();
    const match: Record<string, unknown> = {};
    if (imdbId) match.imdbId = imdbId;
    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: '$imdbId',
          imdbId: { $first: '$imdbId' },
          avgRating: { $avg: '$rating' },
          votes: { $sum: 1 },
          lastVoteAt: { $max: '$updatedAt' },
        },
      },
      { $sort: { avgRating: -1 as -1 | 1, votes: -1 as -1 | 1, lastVoteAt: -1 as -1 | 1 } },
      { $limit: limit },
    ];
    const results: Array<{ imdbId: string; avgRating: number; votes: number; lastVoteAt: Date }> = await Vote.aggregate(pipeline);
    return results.map((r: { imdbId: string; avgRating: number; votes: number; lastVoteAt: Date }) => ({
      imdbId: r.imdbId,
      avgRating: Number(r.avgRating.toFixed(2)),
      votes: r.votes,
      lastVoteAt: r.lastVoteAt,
    }));
  }
}
