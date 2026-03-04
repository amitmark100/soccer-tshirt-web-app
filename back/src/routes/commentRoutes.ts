import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { createComment, getCommentsByPost, getComments, getCommentById, updateComment, deleteComment } from '../controllers/commentController';

const router = Router();

/**
 * @route   POST /api/comments
 * @desc    Add a new comment to a post
 * @access  Private (requires authentication)
 */
router.post('/', authMiddleware, createComment);

/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get all comments for a specific post (newest first)
 * @access  Public
 */
router.get('/post/:postId', getCommentsByPost);

/**
 * @route   GET /api/comments
 * @desc    Get all comments with optional filtering by post
 * @access  Public
 */
router.get('/', getComments);

/**
 * @route   GET /api/comments/:id
 * @desc    Get a single comment by ID
 * @access  Public
 */
router.get('/:id', getCommentById);

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment (only author can update)
 * @access  Private (requires authentication)
 */
router.put('/:id', authMiddleware, updateComment);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (only author can delete)
 * @access  Private (requires authentication)
 */
router.delete('/:id', authMiddleware, deleteComment);

export default router;

