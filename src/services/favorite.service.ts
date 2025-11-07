import { FavoriteRepository } from "../repositories/favorite.repository.js";
import { MovieService } from "./movie.service.js";
import { toStringId } from "../utils/mongo.js";
import type { FavoritePayload } from "../models/favorite.model.js";

type RequestUser = {
  id: string;
};

export class FavoriteService {
  private readonly repo = new FavoriteRepository();
  private readonly movieService = new MovieService();

  async list(user: RequestUser, page = 1, pageSize = 20) {
    return this.repo.listByUser(user.id, page, pageSize);
  }

  async add(user: RequestUser, payload: FavoritePayload) {
    const movie = await this.movieService.ensureMovie(payload.imdbId, {
      userId: user.id,
    });
    const movieId = toStringId(movie);
    return this.repo.create({
      imdbId: movie.imdbId,
      movieId,
      userId: user.id,
      notes: payload.notes,
    });
  }

  async update(user: RequestUser, imdbId: string, notes?: string) {
    const existing = await this.repo.findByUserAndImdb(user.id, imdbId);
    if (!existing) throw new Error("Favorito nao encontrado");
    const favoriteId = toStringId(existing);
    if (!favoriteId) throw new Error("Favorito nao encontrado");
    return this.repo.updateNotes(favoriteId, notes);
  }

  async remove(user: RequestUser, imdbId: string) {
    const deleted = await this.repo.deleteByUserAndImdb(user.id, imdbId);
    if (!deleted) throw new Error("Favorito nao encontrado");
    return deleted;
  }

  async removeAllForUser(userId: string) {
    await this.repo.deleteAllForUser(userId);
  }
}
