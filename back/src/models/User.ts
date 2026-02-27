import mongoose, { Schema, Model, InferSchemaType } from 'mongoose';
import bcrypt from 'bcryptjs';
import { jerseySchema } from './general';

/**
 * User Schema: Main user document in the database
 * Includes authentication, profile, and wishlist information
 */
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    profilePicture: {
      type: String,
      default: null, // Local path to profile image
    },
    refreshTokens: {
      type: [String],
      default: [],
    },
    likedPosts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    wishlist: [jerseySchema],
  },
  { timestamps: true }
);

/**
 * Pre-save middleware: Hash password before saving
 * Only hash if password is modified (new user or password change)
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Post-findOneAndUpdate middleware: Sync user profile changes to all related documents
 * When a user updates their username or profilePicture, update all Posts and Comments
 */
userSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;

  const updateFields: Record<string, string> = {};
  const updateData = this.getUpdate() as Record<string, unknown>;

  // Check if username or profilePicture was updated
  if (updateData?.username) {
    updateFields['user.username'] = updateData.username as string;
  }
  if (updateData?.profilePicture) {
    updateFields['user.profilePicture'] = updateData.profilePicture as string;
  }

  // If there are fields to update, update related documents
  if (Object.keys(updateFields).length > 0) {
    try {
      const authorUpdateFields: Record<string, string> = {};
      Object.keys(updateFields).forEach((key) => {
        const newKey = key.replace('user.', 'author.');
        authorUpdateFields[newKey] = updateFields[key];
      });

      // Update all posts by this user
      await mongoose.model('Post').updateMany(
        { 'user._id': doc._id },
        { $set: updateFields }
      );

      // Update all comments by this user
      await mongoose.model('Comment').updateMany(
        { 'author._id': doc._id },
        { $set: authorUpdateFields }
      );
    } catch (error) {
      console.error('Error syncing user profile updates:', error);
    }
  }
});

/**
 * Instance method: Compare password with hashed password in database
 */
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

type UserSchemaType = InferSchemaType<typeof userSchema>;

interface IUser extends UserSchemaType {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {}

const User = mongoose.model<IUser, IUserModel>('User', userSchema);

export default User;
export type { IUser };
