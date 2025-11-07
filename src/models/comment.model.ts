import { z } from "zod";

export const createCommentSchema = z.object({
  imdbId: z.string().min(1, "imdb_id obrigatorio").max(30),
  rating: z.number().int().min(1).max(10),
  comment: z.string().min(3).max(1000),
});

export const updateCommentSchema = z.object({
  rating: z.number().int().min(1).max(10).optional(),
  comment: z.string().min(3).max(1000).optional(),
});

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "id invalido"),
});

export const getByImdbSchema = z.object({
  imdbId: z.string().min(1).max(30),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type IdParam = z.infer<typeof idParamSchema>;
export type GetByImdbParam = z.infer<typeof getByImdbSchema>;
