import mongoose from "mongoose";
import {
  getUserModel,
  type UserDoc,
} from "../config/database.js";

type UserRecord = Omit<UserDoc, "_id"> & {
  _id: mongoose.Types.ObjectId;
  id: string;
};

export class UserRepository {
  private model() {
    return getUserModel();
  }

  private mapUser(doc: any | null): UserRecord | null {
    if (!doc) return null;
    const plain =
      typeof doc.toJSON === "function"
        ? doc.toJSON()
        : { ...doc };
    const id =
      plain.id ??
      (plain._id && typeof plain._id.toString === "function"
        ? plain._id.toString()
        : plain._id);
    return { ...plain, id } as UserRecord;
  }

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: "admin" | "user";
  }): Promise<UserRecord> {
    const User = this.model();
    const doc = await User.create({
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role ?? "user",
    });
    return this.mapUser(doc)!;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const User = this.model();
    const doc = await User.findOne({ email }).lean({ virtuals: true });
    return this.mapUser(doc);
  }

  async countAll() {
    const User = this.model();
    return User.countDocuments();
  }

  async findById(id: string): Promise<UserRecord | null> {
    const User = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    const doc = await User.findById(id).lean({ virtuals: true });
    return this.mapUser(doc);
  }

  async updateProfile(
    userId: string,
    data: { name?: string | undefined; email?: string | undefined }
  ): Promise<UserRecord | null> {
    const User = this.model();
    if (!mongoose.isValidObjectId(userId)) return null;
    const doc = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { new: true }
    ).lean({ virtuals: true });
    return this.mapUser(doc);
  }

  async updatePassword(
    userId: string,
    passwordHash: string
  ): Promise<UserRecord | null> {
    const User = this.model();
    if (!mongoose.isValidObjectId(userId)) return null;
    const doc = await User.findByIdAndUpdate(
      userId,
      { $set: { passwordHash } },
      { new: true }
    ).lean({ virtuals: true });
    return this.mapUser(doc);
  }

  async setLastLogin(userId: string, date: Date) {
    const User = this.model();
    if (!mongoose.isValidObjectId(userId)) return null;
    await User.findByIdAndUpdate(userId, { $set: { lastLoginAt: date } });
  }

  async deleteById(userId: string) {
    const User = this.model();
    if (!mongoose.isValidObjectId(userId)) return false;
    const result = await User.findByIdAndDelete(userId);
    return Boolean(result);
  }
}
