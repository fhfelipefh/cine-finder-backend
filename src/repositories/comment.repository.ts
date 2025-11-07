import mongoose from "mongoose";
import { getCommentModel } from "../config/database.js";

export class CommentRepository {
  private model() {
    return getCommentModel();
  }

  async listByImdb(imdbId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const Comment = this.model();
    const [items, total] = await Promise.all([
      Comment.find({ imdbId: imdbId.toUpperCase() })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean({ virtuals: true }),
      Comment.countDocuments({ imdbId: imdbId.toUpperCase() }),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const Comment = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Comment.findById(id).lean({ virtuals: true });
  }

  async create(data: {
    imdbId: string;
    movieId: string;
    userId: string;
    comment: string;
    rating: number;
    authorName: string;
  }) {
    const Comment = this.model();
    const doc = await Comment.create({
      imdbId: data.imdbId.toUpperCase(),
      movie: data.movieId,
      user: data.userId,
      comment: data.comment,
      rating: data.rating,
      authorName: data.authorName,
    });
    return doc.toJSON();
  }

  async update(
    id: string,
    data: {
      comment?: string | undefined;
      rating?: number | undefined;
    }
  ) {
    const Comment = this.model();
    if (!mongoose.isValidObjectId(id)) throw new Error("Comentario nao encontrado");
    return Comment.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean({ virtuals: true });
  }

  async delete(id: string) {
    const Comment = this.model();
    if (!mongoose.isValidObjectId(id)) throw new Error("Comentario nao encontrado");
    await Comment.findByIdAndDelete(id);
    return { success: true } as const;
  }

  async deleteByUser(userId: string) {
    const Comment = this.model();
    await Comment.deleteMany({ user: userId });
  }
}
