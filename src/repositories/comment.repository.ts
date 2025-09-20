import { prisma } from '../config/database.js';
import type { UpdateCommentInput } from '../models/comment.model.js';

export class CommentRepository {
  async listByImdb(imdbId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where: { imdbId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.comment.count({ where: { imdbId } })
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: number) {
    return prisma.comment.findUnique({ where: { id } });
  }

  async create(data: { imdbId: string; author: string; rating: number; comment: string; ipHash: string; }) {
    return prisma.comment.create({
      data,
    });
  }

  async update(id: number, data: UpdateCommentInput) {
    const updateData: any = {};
    if (data.author !== undefined) updateData.author = data.author;
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    return prisma.comment.update({ where: { id }, data: updateData });
  }

  async delete(id: number) {
    return prisma.comment.delete({ where: { id } });
  }
}
