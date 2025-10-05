import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

let isConnected = false;

const CommentSchema = new Schema(
  {
    imdbId: { type: String, required: true, index: true },
    author: { type: String, required: true },
    ipHash: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true },
  },
  { timestamps: true, versionKey: false, collection: "comments" }
);

CommentSchema.index({ imdbId: 1, createdAt: -1 });
CommentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

const VoteSchema = new Schema(
  {
    imdbId: { type: String, required: true, index: true },
    ipHash: { type: String, required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
  },
  { timestamps: true, versionKey: false, collection: "votes" }
);

VoteSchema.index({ imdbId: 1, ipHash: 1 }, { unique: true });
VoteSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

export type CommentDoc = InferSchemaType<typeof CommentSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type VoteDoc = InferSchemaType<typeof VoteSchema> & {
  _id: mongoose.Types.ObjectId;
};

let CommentModelInternal: Model<CommentDoc> | null = null;
let VoteModelInternal: Model<VoteDoc> | null = null;

export async function connectMongo(dbUrl?: string) {
  if (isConnected) return mongoose.connection;

  const url = dbUrl || process.env.db_url;
  if (!url) {
    throw new Error("Variável de ambiente db_url não definida");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(url, { autoIndex: true });
  isConnected = true;

  CommentModelInternal =
    mongoose.models.Comment ||
    mongoose.model<CommentDoc>("Comment", CommentSchema, "comments");
  VoteModelInternal =
    mongoose.models.Vote ||
    mongoose.model<VoteDoc>("Vote", VoteSchema, "votes");

  await Promise.all([
    CommentModelInternal.createCollection().catch(() => {}),
    VoteModelInternal.createCollection().catch(() => {}),
  ]);

  return mongoose.connection;
}

export function getMongo() {
  return mongoose.connection;
}

export function getCommentModel(): Model<CommentDoc> {
  if (!CommentModelInternal)
    throw new Error("Mongo não conectado: CommentModel");
  return CommentModelInternal;
}

export function getVoteModel(): Model<VoteDoc> {
  if (!VoteModelInternal) throw new Error("Mongo não conectado: VoteModel");
  return VoteModelInternal;
}
