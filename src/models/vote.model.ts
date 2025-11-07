import { z } from "zod";

export const upsertVoteSchema = z.object({
  imdbId: z.string().min(1).max(30),
  rating: z.number().int().min(1).max(10),
});

export const voteIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "id invalido"),
});

export type UpsertVoteInput = z.infer<typeof upsertVoteSchema>;
