import { getCommunityTopModel } from "../config/database.js";

const DEFAULT_SLUG = "community-top";

export class CommunityTopRepository {
  private model() {
    return getCommunityTopModel();
  }

  private async findOrCreateBase() {
    const Top = this.model();
    let doc = await Top.findOne({ slug: DEFAULT_SLUG })
      .populate("items.movie")
      .lean({ virtuals: true });
    if (doc) return doc;
    await Top.create({ slug: DEFAULT_SLUG, items: [] });
    doc = await Top.findOne({ slug: DEFAULT_SLUG })
      .populate("items.movie")
      .lean({ virtuals: true });
    return doc;
  }

  async getCurrent() {
    return this.findOrCreateBase();
  }

  async replaceItems(
    items: { imdbId: string; notes?: string; movieId: string }[],
    updatedBy?: string
  ) {
    const Top = this.model();
    const doc = await Top.findOneAndUpdate(
      { slug: DEFAULT_SLUG },
      {
        $set: {
          items: items.map((item) => ({
            imdbId: item.imdbId.toUpperCase(),
            notes: item.notes ?? "",
            movie: item.movieId,
          })),
          updatedBy,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
      .populate("items.movie")
      .lean({ virtuals: true });
    return doc;
  }
}
