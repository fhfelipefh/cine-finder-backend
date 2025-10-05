import mongoose from "mongoose";
import { getCommentModel } from "../config/database.js";
import type { UpdateCommentInput } from "../models/comment.model.js";

export class CommentRepository {
  async listByImdb(imdbId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const Comment = getCommentModel();
    const [items, total] = await Promise.all([
      Comment.find({ imdbId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean({ virtuals: true }),
      Comment.countDocuments({ imdbId }),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const Comment = getCommentModel();
    if (!mongoose.isValidObjectId(id)) return null;
    return Comment.findById(id).lean({ virtuals: true });
  }

  async create(data: {
    imdbId: string;
    author: string;
    rating: number;
    comment: string;
    ipHash: string;
  }) {
    const Comment = getCommentModel();
    const doc = await Comment.create({
      imdbId: data.imdbId,
      author: data.author,
      ipHash: data.ipHash,
      rating: data.rating,
      comment: data.comment,
    });
    return doc.toJSON();
  }

  async update(
    id: string,
    data: UpdateCommentInput,
    ipHashForAuthorChange?: string
  ) {
    const Comment = getCommentModel();
    if (!mongoose.isValidObjectId(id)) throw new Error("Comentário não encontrado");
    const updateData: Record<string, unknown> = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.author !== undefined) {
      if (!ipHashForAuthorChange) throw new Error("Permissão negada");
      updateData.author = data.author;
    }
    const updated = await Comment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean({ virtuals: true });
    return updated;
  }

  async delete(id: string) {
    const Comment = getCommentModel();
    if (!mongoose.isValidObjectId(id)) throw new Error("Comentário não encontrado");
    await Comment.findByIdAndDelete(id);
    return { success: true } as const;
  }
}
