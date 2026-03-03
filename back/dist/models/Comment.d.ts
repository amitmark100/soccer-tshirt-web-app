import mongoose, { Model, InferSchemaType } from 'mongoose';
import { UserSub } from './general';
/**
 * Comment Schema: Represents comments on a soccer jersey post
 * Includes post reference, author information, and timestamp
 */
declare const commentSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    createdAt: Date;
    postId: mongoose.Types.ObjectId;
    author: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    content: string;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    createdAt: Date;
    postId: mongoose.Types.ObjectId;
    author: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    content: string;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    createdAt: Date;
    postId: mongoose.Types.ObjectId;
    author: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    content: string;
}> & {
    _id: mongoose.Types.ObjectId;
}>;
type CommentSchemaType = InferSchemaType<typeof commentSchema>;
interface IComment extends CommentSchemaType {
    author: UserSub;
}
interface ICommentModel extends Model<IComment> {
}
declare const Comment: ICommentModel;
export default Comment;
export type { IComment };
//# sourceMappingURL=Comment.d.ts.map