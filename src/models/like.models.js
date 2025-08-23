import mongoose, { Schema } from "mongoose";

// only one of the fileds: 'video', 'comment' or 'community' will be liked and other are null
// (i.e like is unique and one like can't be associated with more than one filed such as video, comment or a community-post)

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: ture }
);

export const Like = mongoose.model("Like", likeSchema);
