import { MovieRepository } from "../repositories/movie.repository.js";
import {
  createMovieSchema,
  updateMovieSchema,
} from "../models/movie.model.js";
import type { z } from "zod";

type CreateMovieInput = z.infer<typeof createMovieSchema>;
type UpdateMovieInput = z.infer<typeof updateMovieSchema>;

export class MovieService {
  private readonly repo = new MovieRepository();

  async list(page = 1, pageSize = 20) {
    return this.repo.list({ page, pageSize });
  }

  async getByImdbId(imdbId: string) {
    const movie = await this.repo.findByImdbId(imdbId);
    if (!movie) throw new Error("Filme nao encontrado");
    return movie;
  }

  async create(userId: string, payload: CreateMovieInput) {
    const exists = await this.repo.findByImdbId(payload.imdbId);
    if (exists) throw new Error("Filme ja cadastrado");
    return this.repo.create({ ...payload, createdBy: userId });
  }

  async update(id: string, payload: UpdateMovieInput) {
    const updated = await this.repo.update(id, payload);
    if (!updated) throw new Error("Filme nao encontrado");
    return updated;
  }

  async delete(id: string) {
    const deleted = await this.repo.delete(id);
    if (!deleted) throw new Error("Filme nao encontrado");
    return deleted;
  }

  async ensureMovie(imdbId: string, opts?: { title?: string; userId?: string }) {
    const movie = await this.repo.upsertBasic({
      imdbId,
      title: opts?.title,
      createdBy: opts?.userId,
    });
    if (!movie) {
      throw new Error("Falha ao garantir filme");
    }
    return movie;
  }
}
