import { z } from "zod";

export const communityTopItemInputSchema = z.object({
  imdbId: z.string().trim().min(1, "imdb_id obrigatorio").max(30),
  notes: z
    .string()
    .trim()
    .max(280, "notes deve ter no maximo 280 caracteres")
    .optional(),
});

export const updateCommunityTopSchema = z.object({
  items: z
    .array(communityTopItemInputSchema)
    .max(50, "Limite de 50 itens")
    .default([]),
});

export type UpdateCommunityTopInput = z.infer<typeof updateCommunityTopSchema>;
export type CommunityTopItemInput = z.infer<
  typeof communityTopItemInputSchema
>;
