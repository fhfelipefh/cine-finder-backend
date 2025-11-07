import { z } from "zod";

export const createMovieSchema = z.object({
  imdbId: z.string().min(5).max(30),
  title: z.string().min(1).max(200),
  posterUrl: z.string().url().optional().or(z.literal("")),
  year: z.string().max(10).optional(),
  synopsis: z.string().max(2000).optional(),
});

export const updateMovieSchema = createMovieSchema.partial();
