import { Schema, InferSchemaType } from 'mongoose';

/**
 * User Sub-Schema: Represents essential user information for nested documents
 * Used in Post and Comment documents to maintain user details without full references
 */
const userSubSchema = new Schema(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    profilePicture: {
      type: String,
      default: null, // Local path to profile image or null
    },
  },
  { _id: false }
);

export type UserSub = InferSchemaType<typeof userSubSchema>;

/**
 * Jersey Schema: Represents soccer jersey details
 * Used as embedded schema in Post and User Wishlist
 */
const jerseySchema = new Schema(
  {
    team: {
      type: String,
      required: true,
      trim: true,
    },
    league: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    size: {
      type: String,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true, // Local path to jersey image
    },
  },
  { _id: true }
);

export type Jersey = InferSchemaType<typeof jerseySchema>;

export { userSubSchema, jerseySchema };
