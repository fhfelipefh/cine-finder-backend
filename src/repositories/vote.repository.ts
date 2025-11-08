import mongoose, { type PipelineStage } from "mongoose";
import { getVoteModel } from "../config/database.js";

export class VoteRepository {
  private model() {
    return getVoteModel();
  }

  async upsertVote(data: {
    imdbId: string;
    movieId: string;
    userId: string;
    rating: number;
  }) {
    const Vote = this.model();
    const doc = await Vote.findOneAndUpdate(
      { imdbId: data.imdbId.toUpperCase(), user: data.userId },
      {
        $set: {
          rating: data.rating,
          movie: data.movieId,
          user: data.userId,
          identityType: "user",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean({ virtuals: true });
    return doc;
  }

  async listMyVotes(userId: string, page = 1, pageSize = 20) {
    const Vote = this.model();
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      Vote.find({ user: userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean({ virtuals: true }),
      Vote.countDocuments({ user: userId }),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const Vote = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Vote.findById(id).lean({ virtuals: true });
  }

  async delete(id: string) {
    const Vote = this.model();
    if (!mongoose.isValidObjectId(id)) throw new Error("Voto nao encontrado");
    await Vote.findByIdAndDelete(id);
    return { success: true } as const;
  }

  async getRanking({
    imdbId,
    limit = 50,
  }: {
    imdbId?: string;
    limit?: number;
  }) {
    const Vote = this.model();
    const match: Record<string, unknown> = {};
    if (imdbId) {
      match.imdbId = imdbId.toUpperCase();
    }
    const pipeline: PipelineStage[] = [
      { $match: match },
      {
        $group: {
          _id: "$imdbId",
          imdbId: { $first: "$imdbId" },
          avgRating: { $avg: "$rating" },
          votes: { $sum: 1 },
          lastVoteAt: { $max: "$updatedAt" },
        },
      },
      {
        $sort: {
          avgRating: -1 as const,
          votes: -1 as const,
          lastVoteAt: -1 as const,
        },
      },
      { $limit: limit },
    ];
    const results: Array<{
      imdbId: string;
      avgRating: number;
      votes: number;
      lastVoteAt: Date;
    }> = await Vote.aggregate(pipeline);
    return results.map((r) => ({
      imdbId: r.imdbId,
      avgRating: Number(Number(r.avgRating).toFixed(2)),
      votes: r.votes,
      lastVoteAt: r.lastVoteAt,
    }));
  }

  async deleteByUser(userId: string) {
    const Vote = this.model();
    await Vote.deleteMany({ user: userId });
  }

  async listVotesForMovies(imdbIds: string[]) {
    if (!imdbIds.length) return [];
    const Vote = this.model();
    const normalized = Array.from(
      new Set(
        imdbIds
          .filter((id) => Boolean(id))
          .map((id) => id.toUpperCase())
      )
    );
    return Vote.find({ imdbId: { $in: normalized } })
      .sort({ updatedAt: -1 })
      .populate("user", "name email role")
      .lean({ virtuals: true });
  }
}
