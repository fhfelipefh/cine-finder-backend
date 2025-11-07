import { z } from "zod";

export const favoritePayloadSchema = z.object({
  imdbId: z.string().min(1).max(30),
  notes: z.string().max(500).optional(),
});

export const favoriteParamSchema = z.object({
  imdbId: z.string().min(1).max(30),
});

export type FavoritePayload = z.infer<typeof favoritePayloadSchema>;
