import mongoose, { Schema, Model, InferSchemaType } from 'mongoose';
import { userSubSchema, jerseySchema, UserSub, Jersey } from './general';

/**
 * Post Schema: Represents a soccer jersey post/listing
 * Includes user information, jersey details, engagement metrics, and timestamps
 */
const postSchema = new Schema(
  {
    user: {
      type: userSubSchema,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    image: {
      type: String,
      default: null, // Local path to post image
    },
    jerseyDetails: {
      type: jerseySchema,
      required: true,
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

/**
 * Index for optimized querying: Commonly query by user ID and creation date
 */
postSchema.index({ 'user._id': 1, createdAt: -1 });
postSchema.index({ likes: 1 }); // Index on likes for popular posts queries

type PostSchemaType = InferSchemaType<typeof postSchema>;

interface IPost extends PostSchemaType {
  user: UserSub;
  jerseyDetails: Jersey;
}

interface IPostModel extends Model<IPost> {}

const Post = mongoose.model<IPost, IPostModel>('Post', postSchema);

export default Post;
export type { IPost };
