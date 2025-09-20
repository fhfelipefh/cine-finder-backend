import { z } from 'zod';

export const createCommentSchema = z.object({
  imdbId: z.string().min(1, 'imdb_id é obrigatório').max(20),
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
  id: z.string().regex(/^\d+$/).transform(Number),
});

export const getByImdbSchema = z.object({
  imdbId: z.string().min(1).max(20),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type GetByImdbParam = z.infer<typeof getByImdbSchema>;
