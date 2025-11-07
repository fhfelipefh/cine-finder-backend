import mongoose from "mongoose";
import { getFavoriteModel } from "../config/database.js";

export class FavoriteRepository {
  private model() {
    return getFavoriteModel();
  }

  async listByUser(userId: string, page = 1, pageSize = 20) {
    const Favorite = this.model();
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      Favorite.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean({ virtuals: true }),
      Favorite.countDocuments({ user: userId }),
    ]);
    return { items, total, page, pageSize };
  }

  async findById(id: string) {
    const Favorite = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Favorite.findById(id).lean({ virtuals: true });
  }

  async findByUserAndImdb(userId: string, imdbId: string) {
    const Favorite = this.model();
    return Favorite.findOne({
      user: userId,
      imdbId: imdbId.toUpperCase(),
    }).lean({ virtuals: true });
  }

  async create(data: {
    userId: string;
    movieId: string;
    imdbId: string;
    notes?: string | undefined;
  }) {
    const Favorite = this.model();
    const doc = await Favorite.create({
      user: data.userId,
      movie: data.movieId,
      imdbId: data.imdbId.toUpperCase(),
      notes: data.notes ?? "",
    });
    return doc.toJSON();
  }

  async updateNotes(id: string, notes?: string | undefined) {
    const Favorite = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Favorite.findByIdAndUpdate(
      id,
      { $set: { notes: notes ?? "" } },
      { new: true }
    ).lean({ virtuals: true });
  }

  async deleteByUserAndImdb(userId: string, imdbId: string) {
    const Favorite = this.model();
    return Favorite.findOneAndDelete({
      user: userId,
      imdbId: imdbId.toUpperCase(),
    }).lean({ virtuals: true });
  }

  async deleteAllForUser(userId: string) {
    const Favorite = this.model();
    await Favorite.deleteMany({ user: userId });
  }
}
