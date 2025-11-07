import { CommentRepository } from "../repositories/comment.repository.js";
import type {
  CreateCommentInput,
  UpdateCommentInput,
} from "../models/comment.model.js";
import { hasProfanity } from "../utils/profanity.js";
import { MovieService } from "./movie.service.js";
import { toStringId } from "../utils/mongo.js";

type RequestUser = {
  id: string;
  name: string;
  role: "admin" | "user";
};

export class CommentService {
  private readonly repo = new CommentRepository();
  private readonly movieService = new MovieService();

  async listByImdb(imdbId: string, page = 1, pageSize = 20) {
    return this.repo.listByImdb(imdbId, page, pageSize);
  }

  async create(user: RequestUser, payload: CreateCommentInput) {
    if (hasProfanity(payload.comment)) {
      throw new Error("Conteudo improprio detectado");
    }
    const movie = await this.movieService.ensureMovie(payload.imdbId, {
      userId: user.id,
    });
    const movieId = toStringId(movie);
    return this.repo.create({
      imdbId: movie.imdbId,
      movieId,
      userId: user.id,
      comment: payload.comment,
      rating: payload.rating,
      authorName: user.name,
    });
  }

  async update(user: RequestUser, id: string, data: UpdateCommentInput) {
    if (!data.comment && !data.rating) {
      throw new Error("Nenhum dado para atualizar");
    }
    if (data.comment && hasProfanity(data.comment)) {
      throw new Error("Conteudo improprio detectado");
    }
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error("Comentario nao encontrado");
    const existingUserId = toStringId(existing.user);
    const isOwner = existingUserId === user.id;
    if (!isOwner && user.role !== "admin") {
      throw new Error("Permissao negada");
    }
    return this.repo.update(id, data);
  }

  async remove(user: RequestUser, id: string) {
    if (user.role !== "admin") {
      throw new Error("Somente administradores podem remover comentarios");
    }
    const existing = await this.repo.getById(id);
    if (!existing) throw new Error("Comentario nao encontrado");
    return this.repo.delete(id);
  }
}
