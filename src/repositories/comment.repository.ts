import { prisma } from "../config/database.js";
import type { UpdateCommentInput } from "../models/comment.model.js";

export class CommentRepository {
  async listByImdb(imdbId: string, page = 1, pageSize = 20) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where: { movie: { imdbId } },
        include: {
          author: { select: { id: true, name: true } },
          movie: { select: { id: true, imdbId: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.comment.count({ where: { movie: { imdbId } } }),
    ]);
    return { items, total, page, pageSize };
  }

  async getById(id: number) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, ipHash: true } },
        movie: { select: { id: true, imdbId: true } },
      },
    });
  }

  async create(data: {
    imdbId: string;
    author: string;
    rating: number;
    comment: string;
    ipHash: string;
  }) {
    const movie = await prisma.movie.upsert({
      where: { imdbId: data.imdbId },
      update: {},
      create: { imdbId: data.imdbId },
    });
    const author = await prisma.author.upsert({
      where: { name_ipHash: { name: data.author, ipHash: data.ipHash } },
      update: {},
      create: { name: data.author, ipHash: data.ipHash },
    });
    return prisma.comment.create({
      data: {
        rating: data.rating,
        comment: data.comment,
        authorId: author.id,
        movieId: movie.id,
      },
      include: {
        author: { select: { id: true, name: true } },
        movie: { select: { id: true, imdbId: true } },
      },
    });
  }

  async update(
    id: number,
    data: UpdateCommentInput,
    ipHashForAuthorChange?: string
  ) {
    const updateData: any = {};
    if (data.rating !== undefined) updateData.rating = data.rating;
    if (data.comment !== undefined) updateData.comment = data.comment;
    if (data.author !== undefined) {
      if (!ipHashForAuthorChange) throw new Error("Permissão negada");
      const newAuthor = await prisma.author.upsert({
        where: {
          name_ipHash: { name: data.author, ipHash: ipHashForAuthorChange },
        },
        update: {},
        create: { name: data.author, ipHash: ipHashForAuthorChange },
      });
      updateData.authorId = newAuthor.id;
    }
    return prisma.comment.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true } },
        movie: { select: { id: true, imdbId: true } },
      },
    });
  }

  async delete(id: number) {
    return prisma.comment.delete({ where: { id } });
  }
}
