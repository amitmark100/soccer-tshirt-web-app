import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/Post';
import User from '../models/User';

/**
 * Validation helper for jerseyDetails object
 */
export const validateJerseyDetails = (jerseyDetails: any): { valid: boolean; error?: string } => {
  if (!jerseyDetails || typeof jerseyDetails !== 'object') {
    return { valid: false, error: 'jerseyDetails must be an object' };
  }

  const requiredFields = ['team', 'league', 'price', 'size', 'imageUrl'];
  for (const field of requiredFields) {
    if (!jerseyDetails[field]) {
      return { valid: false, error: `jerseyDetails.${field} is required` };
    }
  }

  // Validate size is one of allowed values
  const validSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  if (!validSizes.includes(jerseyDetails.size)) {
    return {
      valid: false,
      error: `jerseyDetails.size must be one of: ${validSizes.join(', ')}`,
    };
  }

  // Validate price is a number
  if (typeof jerseyDetails.price !== 'number' || jerseyDetails.price <= 0) {
    return { valid: false, error: 'jerseyDetails.price must be a positive number' };
  }

  return { valid: true };
};

/**
 * @desc    Add a new post
 * @access  Private (requires authentication)
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    let { text, jerseyDetails } = req.body;

    // Parse jerseyDetails if it arrives as a string (from multipart/form-data)
    if (typeof jerseyDetails === 'string') {
      jerseyDetails = JSON.parse(jerseyDetails);
    }

    // Validation: Required fields
    if (!text) {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    if (!jerseyDetails) {
      res.status(400).json({ error: 'jerseyDetails object is required' });
      return;
    }

    // Validation: jerseyDetails structure
    const jerseyValidation = validateJerseyDetails(jerseyDetails);
    if (!jerseyValidation.valid) {
      res.status(400).json({ error: jerseyValidation.error });
      return;
    }

    // Get image path from uploaded file (if exists)
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Create post with user info from authenticated request
    const post = await Post.create({
      user: req.user, // Automatically attach authenticated user's sub-schema
      text,
      image,
      jerseyDetails,
      likes: [],
      commentsCount: 0,
    });

    res.status(201).json(post);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Get all posts with optional filtering
 * @access  Public
 */
export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    const filter = userId ? { 'user._id': userId } : {};

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    res.json(posts);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Get a single post by ID
 * @access  Public
 */
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).lean();

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Update a post (only owner can update)
 * @access  Private (requires authentication)
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  console.log('updatePost - Body:', req.body);
  try {
    const { id } = req.params;
    let { text, image, jerseyDetails } = req.body;

    // Parse jerseyDetails if it arrives as a string (from multipart/form-data)
    if (typeof jerseyDetails === 'string') {
      jerseyDetails = JSON.parse(jerseyDetails);
    }

    // Validation: Required fields
    if (!text) {
      res.status(400).json({ error: 'text is required' });
      return;
    }

    if (!jerseyDetails) {
      res.status(400).json({ error: 'jerseyDetails object is required' });
      return;
    }

    // Validation: jerseyDetails structure
    const jerseyValidation = validateJerseyDetails(jerseyDetails);
    if (!jerseyValidation.valid) {
      res.status(400).json({ error: jerseyValidation.error });
      return;
    }

    // Get the post
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check ownership: Only the creator can update
    if (post.user._id.toString() !== req.user!._id) {
      res.status(403).json({ error: 'You can only update your own posts' });
      return;
    }

    const updated = await Post.findByIdAndUpdate(
      id,
      { text, image: image || null, jerseyDetails },
      { new: true, runValidators: true }
    ).lean();

    res.json(updated);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Delete a post (only owner can delete)
 * @access  Private (requires authentication)
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get the post
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check ownership: Only the creator can delete
    if (post.user._id.toString() !== req.user!._id) {
      res.status(403).json({ error: 'You can only delete your own posts' });
      return;
    }

    await Post.findByIdAndDelete(id);

    res.json({ msg: 'Post deleted successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Toggle like on a post (atomic operation with bi-directional consistency)
 * @access  Private (requires authentication)
 * @details Maintains consistency between Post.likes and User.likedPosts arrays:
 *          - Determine if user is currently liking the post
 *          - If liking: $addToSet user to Post.likes and postId to User.likedPosts
 *          - If unliking: $pull user from Post.likes and postId from User.likedPosts
 *          - Both updates execute concurrently with Promise.all
 */
export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user!._id);

    // First, fetch the post to check if user is already in likes array
    const post = await Post.findById(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    // Determine if user is already in likes array
    const isLiked = post.likes.some(like => like.toString() === userId.toString());

    // Prepare both updates based on current state
    // If unliking: use $pull to remove; if liking: use $addToSet to add
    const postUpdateOp = isLiked
      ? { $pull: { likes: userId } }
      : { $addToSet: { likes: userId } };

    const userUpdateOp = isLiked
      ? { $pull: { likedPosts: id } }
      : { $addToSet: { likedPosts: id } };

    // Execute both updates concurrently for efficiency
    const [updatedPost] = await Promise.all([
      Post.findByIdAndUpdate(id, postUpdateOp, { new: true }).lean(),
      User.findByIdAndUpdate(userId, userUpdateOp, { new: true }).lean(),
    ]);

    res.json(updatedPost);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};
