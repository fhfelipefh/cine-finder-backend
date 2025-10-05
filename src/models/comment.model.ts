import { z } from 'zod';

export const createCommentSchema = z.object({
  imdbId: z.string().min(1, 'imdb_id é obrigatório').max(30),
  author: z.string().min(1, 'Autor é obrigatório').max(100),
  rating: z.number().int().min(1).max(10),
  comment: z.string().min(1).max(1000),
});

export const updateCommentSchema = z.object({
  author: z.string().min(1).max(100).optional(),
  rating: z.number().int().min(1).max(10).optional(),
  comment: z.string().min(1).max(1000).optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, 'id inválido'),
});

export const getByImdbSchema = z.object({
  imdbId: z.string().min(1).max(30),
});

export const upsertVoteSchema = z.object({
  imdbId: z.string().min(1).max(30),
  rating: z.number().int().min(1).max(10),
});

export const listMyVotesQuerySchema = z.object({
  page: z.string().optional(),
  pageSize: z.string().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type GetByImdbParam = z.infer<typeof getByImdbSchema>;
export type UpsertVoteInput = z.infer<typeof upsertVoteSchema>;
