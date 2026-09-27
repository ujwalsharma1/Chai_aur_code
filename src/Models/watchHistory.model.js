import mongoose, { Schema } from "mongoose";

const watchHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    watchedDuration: {
      type: Number,
      default: 0,
    },
    lastWatchedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// indexing
watchHistorySchema.index({ user: 1, video: 1 }, { unique: true });

const WatchHistory = mongoose.model("WatchHistory", watchHistorySchema);

export { WatchHistory };
