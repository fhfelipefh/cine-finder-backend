import mongoose, {
  Schema,
  type InferSchemaType,
  type Model,
} from "mongoose";

let isConnected = false;

const toJSONConfig = {
  virtuals: true,
  versionKey: false,
  transform: (_doc: unknown, ret: any) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
} as const;

const UserSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    lastLoginAt: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "users" }
);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.set("toJSON", toJSONConfig);

const MovieSchema = new Schema(
  {
    imdbId: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    posterUrl: { type: String, default: "" },
    year: { type: String, default: "" },
    synopsis: { type: String, default: "" },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  { timestamps: true, versionKey: false, collection: "movies" }
);
MovieSchema.index({ imdbId: 1 }, { unique: true });
MovieSchema.set("toJSON", toJSONConfig);

const CommentSchema = new Schema(
  {
    imdbId: { type: String, required: true, index: true, uppercase: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    comment: { type: String, required: true },
  },
  { timestamps: true, versionKey: false, collection: "comments" }
);
CommentSchema.index({ imdbId: 1, createdAt: -1 });
CommentSchema.index({ user: 1, imdbId: 1 });
CommentSchema.set("toJSON", toJSONConfig);

const VoteSchema = new Schema(
  {
    imdbId: { type: String, required: true, index: true, uppercase: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 10 },
    identityType: {
      type: String,
      enum: ["ip", "uuid"],
      default: "ip",
    },
  },
  { timestamps: true, versionKey: false, collection: "votes" }
);
VoteSchema.index({ imdbId: 1, user: 1 }, { unique: true });
VoteSchema.set("toJSON", toJSONConfig);

const FavoriteSchema = new Schema(
  {
    imdbId: { type: String, required: true, index: true, uppercase: true },
    movie: { type: Schema.Types.ObjectId, ref: "Movie", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false, collection: "favorites" }
);
FavoriteSchema.index({ user: 1, imdbId: 1 }, { unique: true });
FavoriteSchema.set("toJSON", toJSONConfig);

export type UserDoc = InferSchemaType<typeof UserSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type MovieDoc = InferSchemaType<typeof MovieSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type CommentDoc = InferSchemaType<typeof CommentSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type VoteDoc = InferSchemaType<typeof VoteSchema> & {
  _id: mongoose.Types.ObjectId;
};
export type FavoriteDoc = InferSchemaType<typeof FavoriteSchema> & {
  _id: mongoose.Types.ObjectId;
};

let UserModelInternal: Model<UserDoc> | null = null;
let MovieModelInternal: Model<MovieDoc> | null = null;
let CommentModelInternal: Model<CommentDoc> | null = null;
let VoteModelInternal: Model<VoteDoc> | null = null;
let FavoriteModelInternal: Model<FavoriteDoc> | null = null;

export async function connectMongo(dbUrl?: string) {
  if (isConnected) return mongoose.connection;

  const url = dbUrl || process.env.DB_URL || process.env.db_url;
  if (!url) {
    throw new Error("Variavel de ambiente DB_URL nao definida");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(url, { autoIndex: true });
  isConnected = true;

  UserModelInternal =
    mongoose.models.User ||
    mongoose.model<UserDoc>("User", UserSchema, "users");
  MovieModelInternal =
    mongoose.models.Movie ||
    mongoose.model<MovieDoc>("Movie", MovieSchema, "movies");
  CommentModelInternal =
    mongoose.models.Comment ||
    mongoose.model<CommentDoc>("Comment", CommentSchema, "comments");
  VoteModelInternal =
    mongoose.models.Vote ||
    mongoose.model<VoteDoc>("Vote", VoteSchema, "votes");
  FavoriteModelInternal =
    mongoose.models.Favorite ||
    mongoose.model<FavoriteDoc>("Favorite", FavoriteSchema, "favorites");

  await Promise.all([
    UserModelInternal.createCollection().catch(() => {}),
    MovieModelInternal.createCollection().catch(() => {}),
    CommentModelInternal.createCollection().catch(() => {}),
    VoteModelInternal.createCollection().catch(() => {}),
    FavoriteModelInternal.createCollection().catch(() => {}),
  ]);

  return mongoose.connection;
}

export function getMongo() {
  return mongoose.connection;
}

export function getUserModel(): Model<UserDoc> {
  if (!UserModelInternal) throw new Error("Mongo nao conectado: UserModel");
  return UserModelInternal;
}

export function getMovieModel(): Model<MovieDoc> {
  if (!MovieModelInternal) throw new Error("Mongo nao conectado: MovieModel");
  return MovieModelInternal;
}

export function getCommentModel(): Model<CommentDoc> {
  if (!CommentModelInternal)
    throw new Error("Mongo nao conectado: CommentModel");
  return CommentModelInternal;
}

export function getVoteModel(): Model<VoteDoc> {
  if (!VoteModelInternal) throw new Error("Mongo nao conectado: VoteModel");
  return VoteModelInternal;
}

export function getFavoriteModel(): Model<FavoriteDoc> {
  if (!FavoriteModelInternal)
    throw new Error("Mongo nao conectado: FavoriteModel");
  return FavoriteModelInternal;
}
