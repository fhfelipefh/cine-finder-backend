import { z } from "zod";

export const registerUserSchema = z.object({
  name: z.string().min(3).max(120),
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(64),
});

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(6).max(64),
});

export const updateProfileSchema = z.object({
  name: z.string().min(3).max(120).optional(),
  email: z.string().email().toLowerCase().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6).max(64),
  newPassword: z.string().min(6).max(64),
});

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "id invalido"),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
