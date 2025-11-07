import { VoteRepository } from "../repositories/vote.repository.js";
import { MovieService } from "./movie.service.js";
import { toStringId } from "../utils/mongo.js";

type RequestUser = {
  id: string;
  role: "admin" | "user";
};

export class VoteService {
  private readonly repo = new VoteRepository();
  private readonly movieService = new MovieService();

  async upsert(user: RequestUser, imdbId: string, rating: number) {
    const movie = await this.movieService.ensureMovie(imdbId, {
      userId: user.id,
    });
    return this.repo.upsertVote({
      imdbId: movie.imdbId,
      movieId: toStringId(movie),
      userId: user.id,
      rating,
    });
  }

  async listMine(user: RequestUser, page = 1, pageSize = 20) {
    return this.repo.listMyVotes(user.id, page, pageSize);
  }

  async getById(user: RequestUser, id: string) {
    const doc = await this.repo.getById(id);
    if (!doc) throw new Error("Voto nao encontrado");
    const docUserId = toStringId(doc.user);
    const isOwner = docUserId === user.id;
    if (!isOwner && user.role !== "admin") {
      throw new Error("Permissao negada");
    }
    return doc;
  }

  async updateById(user: RequestUser, id: string, rating: number) {
    const current = await this.getById(user, id);
    const ownerId = toStringId(current.user) || user.id;
    const movie = await this.movieService.ensureMovie(current.imdbId, {
      userId: ownerId,
    });
    return this.repo.upsertVote({
      imdbId: movie.imdbId,
      movieId: toStringId(movie),
      userId: ownerId,
      rating,
    });
  }

  async remove(user: RequestUser, id: string) {
    if (user.role !== "admin") {
      throw new Error("Somente administradores podem remover votos");
    }
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error("Voto nao encontrado");
    return this.repo.delete(id);
  }

  async getRanking(limit = 50) {
    return this.repo.getRanking({ limit });
  }

  async getMovieRanking(imdbId: string) {
    const list = await this.repo.getRanking({ imdbId, limit: 1_000 });
    const targetId = imdbId.toUpperCase();
    const item = list.find((i) => i.imdbId === targetId);
    return (
      item ?? {
        imdbId: targetId,
        avgRating: 0,
        votes: 0,
        lastVoteAt: null,
      }
    );
  }
}
