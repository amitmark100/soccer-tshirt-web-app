import mongoose, { Model, InferSchemaType } from 'mongoose';
/**
 * User Schema: Main user document in the database
 * Includes authentication, profile, and wishlist information
 */
declare const userSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    profilePicture: string;
    email: string;
    password: string;
    refreshTokens: string[];
    likedPosts: mongoose.Types.ObjectId[];
    wishlist: mongoose.Types.DocumentArray<{
        team: string;
        league: string;
        price: number;
        size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
        imageUrl: string;
    }>;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    profilePicture: string;
    email: string;
    password: string;
    refreshTokens: string[];
    likedPosts: mongoose.Types.ObjectId[];
    wishlist: mongoose.Types.DocumentArray<{
        team: string;
        league: string;
        price: number;
        size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
        imageUrl: string;
    }>;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    profilePicture: string;
    email: string;
    password: string;
    refreshTokens: string[];
    likedPosts: mongoose.Types.ObjectId[];
    wishlist: mongoose.Types.DocumentArray<{
        team: string;
        league: string;
        price: number;
        size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
        imageUrl: string;
    }>;
}> & {
    _id: mongoose.Types.ObjectId;
}>;
type UserSchemaType = InferSchemaType<typeof userSchema>;
interface IUser extends UserSchemaType {
    comparePassword(candidatePassword: string): Promise<boolean>;
}
interface IUserModel extends Model<IUser> {
}
declare const User: IUserModel;
export default User;
export type { IUser };
//# sourceMappingURL=User.d.ts.map