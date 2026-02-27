import mongoose, { Schema, Model, InferSchemaType } from 'mongoose';
import { userSubSchema, UserSub } from './general';

/**
 * Comment Schema: Represents comments on a soccer jersey post
 * Includes post reference, author information, and timestamp
 */
const commentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: userSubSchema,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

/**
 * Index for optimized querying: Commonly query comments by post ID and creation date
 */
commentSchema.index({ postId: 1, createdAt: -1 });
commentSchema.index({ 'author._id': 1 }); // Index for user's comments

type CommentSchemaType = InferSchemaType<typeof commentSchema>;

interface IComment extends CommentSchemaType {
  author: UserSub;
}

interface ICommentModel extends Model<IComment> {}

const Comment = mongoose.model<IComment, ICommentModel>('Comment', commentSchema);

export default Comment;
export type { IComment };
