import { UserRepository } from "../repositories/user.repository.js";
import {
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { FavoriteRepository } from "../repositories/favorite.repository.js";
import { CommentRepository } from "../repositories/comment.repository.js";
import { VoteRepository } from "../repositories/vote.repository.js";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class UserService {
  private readonly repo = new UserRepository();
  private readonly favoriteRepo = new FavoriteRepository();
  private readonly commentRepo = new CommentRepository();
  private readonly voteRepo = new VoteRepository();

  private toPublic(user: any): PublicUser {
    if (!user) throw new Error("Usuario nao encontrado");
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getProfile(userId: string) {
    const user = await this.repo.findById(userId);
    if (!user) throw new Error("Usuario nao encontrado");
    return this.toPublic(user);
  }

  async updateProfile(userId: string, payload: UpdateProfileInput) {
    if (payload.email) {
      const exists = await this.repo.findByEmail(payload.email);
      if (exists && exists.id.toString() !== userId) {
        throw new Error("Email ja em uso");
      }
    }
    const updated = await this.repo.updateProfile(userId, payload);
    if (!updated) throw new Error("Usuario nao encontrado");
    return this.toPublic(updated);
  }

  async changePassword(userId: string, payload: ChangePasswordInput) {
    const current = await this.repo.findById(userId);
    if (!current) throw new Error("Usuario nao encontrado");
    const matches = await comparePassword(
      payload.currentPassword,
      current.passwordHash ?? ""
    );
    if (!matches) throw new Error("Senha atual invalida");
    const newHash = await hashPassword(payload.newPassword);
    const updated = await this.repo.updatePassword(userId, newHash);
    if (!updated) throw new Error("Usuario nao encontrado");
    return this.toPublic(updated);
  }

  async deleteAccount(userId: string) {
    const existing = await this.repo.findById(userId);
    if (!existing) throw new Error("Usuario nao encontrado");
    await Promise.all([
      this.favoriteRepo.deleteAllForUser(userId),
      this.commentRepo.deleteByUser(userId),
      this.voteRepo.deleteByUser(userId),
    ]);
    await this.repo.deleteById(userId);
    return { success: true as const };
  }

  async deleteUserByAdmin(userId: string) {
    return this.deleteAccount(userId);
  }
}
