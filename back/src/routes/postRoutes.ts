import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { uploadImage } from '../middleware/uploadMiddleware';
import { createPost, getPosts, getPostById, updatePost, deletePost, toggleLike } from '../controllers/postController';
import { aiSearch } from '../controllers/aiController'; // Import aiSearch

const router = Router();

/**
 * @route   POST /api/post
 * @desc    Add a new post
 * @access  Private (requires authentication)
 */
router.post('/', authMiddleware, uploadImage, createPost);

/**
 * @route   GET /api/post
 * @desc    Get all posts with optional filtering
 * @access  Public
 */
router.get('/', getPosts);

/**
 * @route   POST /api/post/ai-search
 * @desc    Search posts using AI-generated filters
 * @access  Private (requires authentication)
 */
router.post('/ai-search', authMiddleware, aiSearch);

/**
 * @route   GET /api/post/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get('/:id', getPostById);

/**
 * @route   PUT /api/post/:id
 * @desc    Update a post (only owner can update)
 * @access  Private (requires authentication)
 */
router.put('/:id', authMiddleware, uploadImage, updatePost);

/**
 * @route   DELETE /api/post/:id
 * @desc    Delete a post (only owner can delete)
 * @access  Private (requires authentication)
 */
router.delete('/:id', authMiddleware, deletePost);

/**
 * @route   PATCH /api/post/:id/like
 * @desc    Toggle like on a post (atomic operation - first click likes, second click unlikes)
 * @access  Private (requires authentication)
 */
router.patch('/:id/like', authMiddleware, toggleLike);

export default router;
