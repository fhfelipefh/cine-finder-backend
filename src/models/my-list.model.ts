import { z } from "zod";

export const myListStatusEnum = z.enum([
  "watching",
  "completed",
  "on-hold",
  "dropped",
  "plan-to-watch",
  "rewatching",
]);

export const myListPriorityEnum = z.enum(["low", "medium", "high"]);

const optionalDateSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  if (value instanceof Date) return value;
  if (typeof value === "string" || value instanceof String) {
    const parsed = new Date(value as string);
    return Number.isNaN(parsed.getTime()) ? value : parsed;
  }
  return value;
}, z.date().nullable().optional());

const tagsSchema = z
  .array(z.string().trim().min(1).max(30))
  .max(10)
  .transform((items) =>
    items.map((tag) => tag.trim()).filter((tag) => Boolean(tag))
  );

export const createMyListSchema = z.object({
  imdbId: z.string().trim().min(1).max(30),
  status: myListStatusEnum.optional(),
  score: z.number().min(0).max(10).optional().nullable(),
  progress: z.number().int().min(0).max(1000).optional(),
  rewatchCount: z.number().int().min(0).max(1000).optional(),
  priority: myListPriorityEnum.optional(),
  startedAt: optionalDateSchema,
  finishedAt: optionalDateSchema,
  notes: z.string().trim().max(1000).optional(),
  tags: tagsSchema.optional(),
  isHidden: z.boolean().optional(),
});

export const updateMyListSchema = createMyListSchema.omit({ imdbId: true });

export const myListQuerySchema = z.object({
  status: myListStatusEnum.optional(),
  priority: myListPriorityEnum.optional(),
  search: z.string().trim().max(120).optional(),
  sortBy: z
    .enum(["updatedAt", "score", "priority", "progress", "title", "startedAt"])
    .default("updatedAt"),
  sortDirection: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const myListIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "id invalido"),
});

export type CreateMyListInput = z.infer<typeof createMyListSchema>;
export type UpdateMyListInput = z.infer<typeof updateMyListSchema>;
export type MyListQueryInput = z.infer<typeof myListQuerySchema>;
export type MyListIdParam = z.infer<typeof myListIdParamSchema>;
