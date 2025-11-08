import mongoose from "mongoose";
import { getUserListModel } from "../config/database.js";
import type { MyListQueryInput } from "../models/my-list.model.js";

export class MyListRepository {
  private model() {
    return getUserListModel();
  }

  async findByUserAndImdb(userId: string, imdbId: string) {
    const MyList = this.model();
    return MyList.findOne({
      user: userId,
      imdbId: imdbId.toUpperCase(),
    }).lean({ virtuals: true });
  }

  async create(data: {
    userId: string;
    movieId: string;
    imdbId: string;
    title: string;
    posterUrl?: string;
    year?: string;
    payload: Record<string, unknown>;
  }) {
    const MyList = this.model();
    const doc = await MyList.create({
      user: data.userId,
      imdbId: data.imdbId.toUpperCase(),
      movie: data.movieId,
      title: data.title,
      posterUrl: data.posterUrl ?? "",
      year: data.year ?? "",
      ...data.payload,
    });
    return doc.toJSON();
  }

  async update(
    id: string,
    userId: string,
    payload: Record<string, unknown>
  ) {
    const MyList = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return MyList.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: payload },
      { new: true }
    ).lean({ virtuals: true });
  }

  async getById(id: string, userId: string) {
    const MyList = this.model();
    if (!mongoose.isValidObjectId(id)) return null;
    return MyList.findOne({ _id: id, user: userId }).lean({ virtuals: true });
  }

  async delete(id: string, userId: string) {
    const MyList = this.model();
    if (!mongoose.isValidObjectId(id)) return false;
    const result = await MyList.findOneAndDelete({
      _id: id,
      user: userId,
    });
    return Boolean(result);
  }

  async list(userId: string, filters: MyListQueryInput) {
    const MyList = this.model();
    const { page, pageSize, status, priority, search, sortBy, sortDirection } =
      filters;
    const query: Record<string, unknown> = { user: userId };
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { title: regex },
        { notes: regex },
        { tags: regex },
        { imdbId: regex },
      ];
    }
    const skip = (page - 1) * pageSize;
    const sortFieldMap: Record<string, string> = {
      updatedAt: "updatedAt",
      score: "score",
      priority: "priority",
      progress: "progress",
      title: "title",
      startedAt: "startedAt",
    };
    const field = sortFieldMap[sortBy] ?? "updatedAt";
    const direction = sortDirection === "asc" ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [field]: direction };
    if (field !== "updatedAt") {
      sort.updatedAt = -1;
    }
    const [items, total] = await Promise.all([
      MyList.find(query)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .lean({ virtuals: true }),
      MyList.countDocuments(query),
    ]);
    return { items, total, page, pageSize };
  }

  async stats(userId: string) {
    const MyList = this.model();
    if (!mongoose.isValidObjectId(userId)) {
      return {
        statusCounts: {},
        totalEntries: 0,
        averageScore: null,
        scoredEntries: 0,
        totalProgress: 0,
        totalRewatchCount: 0,
        lastActivityAt: null,
      };
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const [statusRows, generalRows, avgRows] = await Promise.all([
      MyList.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      MyList.aggregate([
        { $match: { user: userObjectId } },
        {
          $group: {
            _id: null,
            totalEntries: { $sum: 1 },
            totalProgress: { $sum: "$progress" },
            totalRewatchCount: { $sum: "$rewatchCount" },
            lastActivityAt: { $max: "$updatedAt" },
          },
        },
      ]),
      MyList.aggregate([
        { $match: { user: userObjectId, score: { $ne: null } } },
        {
          $group: {
            _id: null,
            averageScore: { $avg: "$score" },
            scoredEntries: { $sum: 1 },
          },
        },
      ]),
    ]);
    const statusCounts = statusRows.reduce<Record<string, number>>(
      (acc, row) => {
        acc[row._id as string] = row.count;
        return acc;
      },
      {}
    );
    const general = generalRows[0] ?? {};
    const avg = avgRows[0] ?? {};
    return {
      statusCounts,
      totalEntries: general.totalEntries ?? 0,
      totalProgress: general.totalProgress ?? 0,
      totalRewatchCount: general.totalRewatchCount ?? 0,
      lastActivityAt: general.lastActivityAt ?? null,
      averageScore: avg.averageScore ?? null,
      scoredEntries: avg.scoredEntries ?? 0,
    };
  }
}
