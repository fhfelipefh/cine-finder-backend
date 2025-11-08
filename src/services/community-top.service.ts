import { CommunityTopRepository } from "../repositories/community-top.repository.js";
import type { UpdateCommunityTopInput } from "../models/community-top.model.js";
import { MovieService } from "./movie.service.js";
import { toStringId } from "../utils/mongo.js";
import { VoteRepository } from "../repositories/vote.repository.js";

export class CommunityTopService {
  private readonly repo = new CommunityTopRepository();
  private readonly movieService = new MovieService();
  private readonly voteRepo = new VoteRepository();

  async getList(opts?: { includeVotes?: boolean; limit?: number }) {
    const doc = await this.repo.getCurrent();
    if (!doc) {
      return { items: [], updatedAt: null as Date | null };
    }
    const includeVotes = opts?.includeVotes ?? false;
    const normalizedLimit =
      typeof opts?.limit === "number" && opts.limit > 0
        ? Math.min(50, Math.max(1, Math.floor(opts.limit)))
        : 10;
    const docId = toStringId(doc);
    const items =
      doc.items?.map((item: any) => ({
        imdbId: item.imdbId,
        notes: item.notes ?? "",
        movie: item.movie
          ? {
            id: toStringId(item.movie),
            title: item.movie.title,
            posterUrl: item.movie.posterUrl,
            year: item.movie.year,
          }
          : undefined,
      })) ?? [];
    const limitedItems =
      normalizedLimit > 0 ? items.slice(0, normalizedLimit) : items;
    let votesByImdb: Record<string, any[]> = {};
    if (includeVotes && limitedItems.length) {
      const imdbIds = Array.from(
        new Set(
          limitedItems
            .map((item) => item.imdbId?.toUpperCase())
            .filter(Boolean)
        )
      ) as string[];
      const votes = await this.voteRepo.listVotesForMovies(imdbIds);
      votesByImdb = votes.reduce((acc: Record<string, any[]>, vote: any) => {
        const key = (vote.imdbId ?? "").toUpperCase();
        if (!key) return acc;
        if (!acc[key]) acc[key] = [];
        acc[key].push({
          id: toStringId(vote),
          rating: vote.rating,
          updatedAt: vote.updatedAt,
          user: vote.user
            ? {
              id: toStringId(vote.user),
              name: vote.user.name,
              email: vote.user.email,
              role: vote.user.role,
            }
            : undefined,
        });
        return acc;
      }, {} as Record<string, Array<{
        id: string;
        rating: number;
        updatedAt: Date;
        user?: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "user";
        };
      }>>);
    }
    return {
      id: docId,
      items: limitedItems.map((item) => {
        const base: Record<string, unknown> = { ...item };
        if (includeVotes) {
          const key = (item.imdbId ?? "").toUpperCase();
          base.votes = key ? votesByImdb[key] ?? [] : [];
        }
        return base;
      }),
      updatedAt: doc.updatedAt ?? null,
    };
  }

  async updateList(userId: string, payload: UpdateCommunityTopInput) {
    const normalized = [];
    for (const entry of payload.items) {
      const movie = await this.movieService.ensureMovie(entry.imdbId, {
        userId,
      });
      normalized.push({
        imdbId: movie.imdbId,
        notes: entry.notes ?? "",
        movieId: toStringId(movie),
      });
    }
    return this.repo.replaceItems(normalized, userId);
  }
}
