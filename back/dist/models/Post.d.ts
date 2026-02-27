import mongoose, { Model, InferSchemaType } from 'mongoose';
import { UserSub, Jersey } from './general';
/**
 * Post Schema: Represents a soccer jersey post/listing
 * Includes user information, jersey details, engagement metrics, and timestamps
 */
declare const postSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    text: string;
    user: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    image: string;
    jerseyDetails: {
        team: string;
        league: string;
        price: number;
        size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
        imageUrl: string;
    };
    likes: mongoose.Types.ObjectId[];
    commentsCount: number;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    text: string;
    user: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    image: string;
    jerseyDetails: {
        team: string;
        league: string;
        price: number;
        size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
        imageUrl: string;
    };
    likes: mongoose.Types.ObjectId[];
    commentsCount: number;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    text: string;
    user: {
        _id: mongoose.Types.ObjectId;
        username: string;
        profilePicture: string;
    };
    image: string;
    jerseyDetails: {
        team: string;
        league: string;
        price: number;
        size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
        imageUrl: string;
    };
    likes: mongoose.Types.ObjectId[];
    commentsCount: number;
}> & {
    _id: mongoose.Types.ObjectId;
}>;
type PostSchemaType = InferSchemaType<typeof postSchema>;
interface IPost extends PostSchemaType {
    user: UserSub;
    jerseyDetails: Jersey;
}
interface IPostModel extends Model<IPost> {
}
declare const Post: IPostModel;
export default Post;
export type { IPost };
//# sourceMappingURL=Post.d.ts.map