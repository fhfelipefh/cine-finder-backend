import { MyListRepository } from "../repositories/my-list.repository.js";
import {
  type CreateMyListInput,
  type MyListQueryInput,
  type UpdateMyListInput,
} from "../models/my-list.model.js";
import { MovieService } from "./movie.service.js";
import { toStringId } from "../utils/mongo.js";

type RequestUser = {
  id: string;
  name: string;
  role: "admin" | "user";
};

export class MyListService {
  private readonly repo = new MyListRepository();
  private readonly movieService = new MovieService();

  async list(userId: string, filters: MyListQueryInput) {
    return this.repo.list(userId, filters);
  }

  async stats(userId: string) {
    return this.repo.stats(userId);
  }

  async getById(userId: string, id: string) {
    const item = await this.repo.getById(id, userId);
    if (!item) throw new Error("Entrada nao encontrada");
    return item;
  }

  private normalizePayload(
    payload: Partial<CreateMyListInput> | Partial<UpdateMyListInput>
  ) {
    const data: Record<string, unknown> = {};
    if ("status" in payload && payload.status) data.status = payload.status;
    if ("score" in payload) {
      data.score =
        payload.score === null || payload.score === undefined
          ? null
          : payload.score;
    }
    if ("progress" in payload && payload.progress !== undefined) {
      data.progress = payload.progress;
    }
    if ("rewatchCount" in payload && payload.rewatchCount !== undefined) {
      data.rewatchCount = payload.rewatchCount;
    }
    if ("priority" in payload && payload.priority) {
      data.priority = payload.priority;
    }
    if ("startedAt" in payload) {
      data.startedAt = payload.startedAt ?? null;
    }
    if ("finishedAt" in payload) {
      data.finishedAt = payload.finishedAt ?? null;
    }
    if ("notes" in payload && payload.notes !== undefined) {
      data.notes = payload.notes?.trim() ?? "";
    }
    if ("tags" in payload && payload.tags !== undefined) {
      const uniqueTags = Array.from(new Set((payload.tags ?? []).map((tag) => tag.trim()))).filter(Boolean);
      data.tags = uniqueTags;
    }
    if ("isHidden" in payload && payload.isHidden !== undefined) {
      data.isHidden = payload.isHidden;
    }
    if (
      data.startedAt &&
      data.finishedAt &&
      data.startedAt instanceof Date &&
      data.finishedAt instanceof Date &&
      data.finishedAt < data.startedAt
    ) {
      throw new Error("finishedAt nao pode ser anterior a startedAt");
    }
    return data;
  }

  async upsert(user: RequestUser, payload: CreateMyListInput) {
    const movie = await this.movieService.ensureMovie(payload.imdbId, {
      userId: user.id,
    });
    const movieId = toStringId(movie);
    const normalized = this.normalizePayload(payload);
    const existing = await this.repo.findByUserAndImdb(user.id, movie.imdbId);
    if (existing) {
      const existingId = toStringId(existing);
      if (!existingId) {
        throw new Error("Entrada invalida");
      }
      const updated = await this.repo.update(existingId, user.id, {
        ...normalized,
        title: movie.title,
        posterUrl: movie.posterUrl ?? "",
        year: movie.year ?? "",
      });
      if (!updated) throw new Error("Falha ao atualizar entrada");
      return { entry: updated, created: false };
    }
    const created = await this.repo.create({
      userId: user.id,
      imdbId: movie.imdbId,
      movieId,
      title: movie.title,
      posterUrl: movie.posterUrl ?? "",
      year: movie.year ?? "",
      payload: normalized,
    });
    return { entry: created, created: true };
  }

  async update(userId: string, id: string, payload: UpdateMyListInput) {
    const normalized = this.normalizePayload(payload);
    if (Object.keys(normalized).length === 0) {
      throw new Error("Nenhum dado para atualizar");
    }
    const updated = await this.repo.update(id, userId, normalized);
    if (!updated) throw new Error("Entrada nao encontrada");
    return updated;
  }

  async remove(userId: string, id: string) {
    const deleted = await this.repo.delete(id, userId);
    if (!deleted) throw new Error("Entrada nao encontrada");
    return { success: true as const };
  }
}
