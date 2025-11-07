import { UserRepository } from "../repositories/user.repository.js";
import {
  type LoginInput,
  type RegisterUserInput,
} from "../models/user.model.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { signAccessToken } from "../utils/token.js";

type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthService {
  private readonly repo = new UserRepository();

  private toPublic(user: any): PublicUser {
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

  private buildToken(user: PublicUser) {
    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
    return token;
  }

  async register(payload: RegisterUserInput) {
    const exists = await this.repo.findByEmail(payload.email);
    if (exists) {
      throw new Error("Email ja cadastrado");
    }
    const totalUsers = await this.repo.countAll();
    const passwordHash = await hashPassword(payload.password);
    const created = await this.repo.create({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: totalUsers === 0 ? "admin" : "user",
    });
    const user = this.toPublic(created);
    const token = this.buildToken(user);
    return { user, token };
  }

  async login(payload: LoginInput) {
    const user = await this.repo.findByEmail(payload.email);
    if (!user) {
      throw new Error("Credenciais invalidas");
    }
    if (user.isActive === false) {
      throw new Error("Usuario inativo");
    }
    const isValid = await comparePassword(
      payload.password,
      user.passwordHash ?? ""
    );
    if (!isValid) {
      throw new Error("Credenciais invalidas");
    }
    await this.repo.setLastLogin(user.id, new Date());
    const publicUser = this.toPublic(user);
    const token = this.buildToken(publicUser);
    return { user: publicUser, token };
  }
}
