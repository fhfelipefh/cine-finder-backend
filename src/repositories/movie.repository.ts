import mongoose from "mongoose";
import { getMovieModel } from "../config/database.js";

export class MovieRepository {
  private model() {
    return getMovieModel();
  }

  async findByImdbId(imdbId: string) {
    const Movie = this.model();
    return Movie.findOne({ imdbId: imdbId.toUpperCase() }).lean({
      virtuals: true,
    });
  }

  async findById(id: string) {
    const Movie = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Movie.findById(id).lean({ virtuals: true });
  }

  async create(data: {
    imdbId: string;
    title: string;
    posterUrl?: string | undefined;
    year?: string | undefined;
    synopsis?: string | undefined;
    createdBy?: string | undefined;
  }) {
    const Movie = this.model();
    const doc = await Movie.create({
      imdbId: data.imdbId.toUpperCase(),
      title: data.title,
      posterUrl: data.posterUrl ?? "",
      year: data.year ?? "",
      synopsis: data.synopsis ?? "",
      createdBy: data.createdBy,
    });
    return doc.toJSON();
  }

  async update(
    id: string,
    data: {
      title?: string | undefined;
      posterUrl?: string | undefined;
      year?: string | undefined;
      synopsis?: string | undefined;
    }
  ) {
    const Movie = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Movie.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean({ virtuals: true });
  }

  async delete(id: string) {
    const Movie = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return Movie.findByIdAndDelete(id).lean({ virtuals: true });
  }

  async list({
    page = 1,
    pageSize = 20,
  }: {
    page?: number;
    pageSize?: number;
  }) {
    const Movie = this.model();
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      Movie.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean({ virtuals: true }),
      Movie.countDocuments({}),
    ]);
    return { items, total, page, pageSize };
  }

  async upsertBasic(data: {
    imdbId: string;
    title?: string | undefined;
    createdBy?: string | undefined;
  }) {
    const Movie = this.model();
    const doc = await Movie.findOneAndUpdate(
      { imdbId: data.imdbId.toUpperCase() },
      {
        $setOnInsert: {
          imdbId: data.imdbId.toUpperCase(),
          title: data.title ?? data.imdbId.toUpperCase(),
          createdBy: data.createdBy,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean({ virtuals: true });
    return doc;
  }
}
