"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const general_1 = require("./general");
/**
 * User Schema: Main user document in the database
 * Includes authentication, profile, and wishlist information
 */
const userSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    wishlist: [general_1.jerseySchema],
}, { timestamps: true });
/**
 * Pre-save middleware: Hash password before saving
 * Only hash if password is modified (new user or password change)
 */
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
/**
 * Post-findOneAndUpdate middleware: Sync user profile changes to all related documents
 * When a user updates their username or profilePicture, update all Posts and Comments
 */
userSchema.post('findOneAndUpdate', async function (doc) {
    if (!doc)
        return;
    const updateFields = {};
    const updateData = this.getUpdate();
    // Check if username or profilePicture was updated
    if (updateData?.username) {
        updateFields['user.username'] = updateData.username;
    }
    if (updateData?.profilePicture) {
        updateFields['user.profilePicture'] = updateData.profilePicture;
    }
    // If there are fields to update, update related documents
    if (Object.keys(updateFields).length > 0) {
        try {
            const authorUpdateFields = {};
            Object.keys(updateFields).forEach((key) => {
                const newKey = key.replace('user.', 'author.');
                authorUpdateFields[newKey] = updateFields[key];
            });
            // Update all posts by this user
            await mongoose_1.default.model('Post').updateMany({ 'user._id': doc._id }, { $set: updateFields });
            // Update all comments by this user
            await mongoose_1.default.model('Comment').updateMany({ 'author._id': doc._id }, { $set: authorUpdateFields });
        }
        catch (error) {
            console.error('Error syncing user profile updates:', error);
        }
    }
});
/**
 * Instance method: Compare password with hashed password in database
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcryptjs_1.default.compare(candidatePassword, this.password);
};
const User = mongoose_1.default.model('User', userSchema);
exports.default = User;
//# sourceMappingURL=User.js.map