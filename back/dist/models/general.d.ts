import { Schema, InferSchemaType } from 'mongoose';
/**
 * User Sub-Schema: Represents essential user information for nested documents
 * Used in Post and Comment documents to maintain user details without full references
 */
declare const userSubSchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    _id: false;
}, {
    _id: import("mongoose").Types.ObjectId;
    username: string;
    profilePicture: string;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    _id: import("mongoose").Types.ObjectId;
    username: string;
    profilePicture: string;
}>> & import("mongoose").FlatRecord<{
    _id: import("mongoose").Types.ObjectId;
    username: string;
    profilePicture: string;
}> & Required<{
    _id: import("mongoose").Types.ObjectId;
}>>;
export type UserSub = InferSchemaType<typeof userSubSchema>;
/**
 * Jersey Schema: Represents soccer jersey details
 * Used as embedded schema in Post and User Wishlist
 */
declare const jerseySchema: Schema<any, import("mongoose").Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    _id: true;
}, {
    team: string;
    league: string;
    price: number;
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
    imageUrl: string;
}, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<{
    team: string;
    league: string;
    price: number;
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
    imageUrl: string;
}>> & import("mongoose").FlatRecord<{
    team: string;
    league: string;
    price: number;
    size: "XS" | "S" | "M" | "L" | "XL" | "XXL";
    imageUrl: string;
}> & {
    _id: import("mongoose").Types.ObjectId;
}>;
export type Jersey = InferSchemaType<typeof jerseySchema>;
export { userSubSchema, jerseySchema };
//# sourceMappingURL=general.d.ts.map