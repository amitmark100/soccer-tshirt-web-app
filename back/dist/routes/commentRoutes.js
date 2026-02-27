"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Comment_1 = __importDefault(require("../models/Comment"));
const Post_1 = __importDefault(require("../models/Post"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
/**
 * @route   POST /api/comments
 * @desc    Add a new comment to a post
 * @access  Private (requires authentication)
 */
router.post('/', authMiddleware_1.default, async (req, res) => {
    try {
        const { postId, content } = req.body;
        // Validation
        if (!postId) {
            res.status(400).json({ error: 'postId is required' });
            return;
        }
        if (!content) {
            res.status(400).json({ error: 'content is required' });
            return;
        }
        // Verify post exists
        const post = await Post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found for given postId' });
            return;
        }
        // Create comment with author sub-schema from authenticated user
        const comment = await Comment_1.default.create({
            postId,
            author: req.user, // Automatically attach authenticated user's sub-schema
            content,
        });
        // Increment comments count on post
        await Post_1.default.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }, { new: true });
        res.status(201).json(comment);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   GET /api/comments/post/:postId
 * @desc    Get all comments for a specific post (newest first)
 * @access  Public
 */
router.get('/post/:postId', async (req, res) => {
    try {
        const { postId } = req.params;
        // Verify post exists
        const post = await Post_1.default.findById(postId);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        const comments = await Comment_1.default.find({ postId })
            .sort({ createdAt: -1 })
            .lean();
        res.json(comments);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   GET /api/comments
 * @desc    Get all comments with optional filtering by post
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { post } = req.query;
        const filter = post ? { postId: post } : {};
        const comments = await Comment_1.default.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        res.json(comments);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   GET /api/comments/:id
 * @desc    Get a single comment by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await Comment_1.default.findById(id).lean();
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        res.json(comment);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment (only author can update)
 * @access  Private (requires authentication)
 */
router.put('/:id', authMiddleware_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        if (!content) {
            res.status(400).json({ error: 'content is required' });
            return;
        }
        // Get the comment
        const comment = await Comment_1.default.findById(id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        // Check ownership: Only the author can update
        if (comment.author._id.toString() !== req.user._id) {
            res.status(403).json({ error: 'You can only update your own comments' });
            return;
        }
        const updated = await Comment_1.default.findByIdAndUpdate(id, { content }, { new: true, runValidators: true }).lean();
        res.json(updated);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment (only author can delete)
 * @access  Private (requires authentication)
 */
router.delete('/:id', authMiddleware_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        // Get the comment
        const comment = await Comment_1.default.findById(id);
        if (!comment) {
            res.status(404).json({ error: 'Comment not found' });
            return;
        }
        // Check ownership: Only the author can delete
        if (comment.author._id.toString() !== req.user._id) {
            res.status(403).json({ error: 'You can only delete your own comments' });
            return;
        }
        await Comment_1.default.findByIdAndDelete(id);
        // Decrement comments count on post
        await Post_1.default.findByIdAndUpdate(comment.postId, { $inc: { commentsCount: -1 } }, { new: true });
        res.json({ msg: 'Comment deleted successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
exports.default = router;
//# sourceMappingURL=commentRoutes.js.map