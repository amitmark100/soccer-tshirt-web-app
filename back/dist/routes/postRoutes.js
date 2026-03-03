"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Post_1 = __importDefault(require("../models/Post"));
const authMiddleware_1 = __importDefault(require("../middleware/authMiddleware"));
const router = (0, express_1.Router)();
/**
 * Validation helper for jerseyDetails object
 */
const validateJerseyDetails = (jerseyDetails) => {
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
 * @route   POST /api/post
 * @desc    Add a new post
 * @access  Private (requires authentication)
 */
router.post('/', authMiddleware_1.default, async (req, res) => {
    try {
        const { text, image, jerseyDetails } = req.body;
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
        // Create post with user info from authenticated request
        const post = await Post_1.default.create({
            user: req.user, // Automatically attach authenticated user's sub-schema
            text,
            image: image || null,
            jerseyDetails,
            likes: [],
            commentsCount: 0,
        });
        res.status(201).json(post);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   GET /api/post
 * @desc    Get all posts with optional filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const filter = userId ? { 'user._id': userId } : {};
        const posts = await Post_1.default.find(filter)
            .sort({ createdAt: -1 })
            .lean();
        res.json(posts);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   GET /api/post/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post_1.default.findById(id).lean();
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        res.json(post);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   PUT /api/post/:id
 * @desc    Update a post (only owner can update)
 * @access  Private (requires authentication)
 */
router.put('/:id', authMiddleware_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        const { text, image, jerseyDetails } = req.body;
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
        const post = await Post_1.default.findById(id);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        // Check ownership: Only the creator can update
        if (post.user._id.toString() !== req.user._id) {
            res.status(403).json({ error: 'You can only update your own posts' });
            return;
        }
        const updated = await Post_1.default.findByIdAndUpdate(id, { text, image: image || null, jerseyDetails }, { new: true, runValidators: true }).lean();
        res.json(updated);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
/**
 * @route   DELETE /api/post/:id
 * @desc    Delete a post (only owner can delete)
 * @access  Private (requires authentication)
 */
router.delete('/:id', authMiddleware_1.default, async (req, res) => {
    try {
        const { id } = req.params;
        // Get the post
        const post = await Post_1.default.findById(id);
        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }
        // Check ownership: Only the creator can delete
        if (post.user._id.toString() !== req.user._id) {
            res.status(403).json({ error: 'You can only delete your own posts' });
            return;
        }
        await Post_1.default.findByIdAndDelete(id);
        res.json({ msg: 'Post deleted successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Server error';
        console.error(errorMessage);
        res.status(500).json({ error: errorMessage });
    }
});
exports.default = router;
//# sourceMappingURL=postRoutes.js.map