import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware';
import { uploadAvatar } from '../middleware/uploadMiddleware';
import { register, login, updateUserProfile } from '../controllers/authController';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   PUT /api/auth/user/:userId
 * @desc    Update user profile (username and/or profilePicture)
 * @desc    Triggers middleware hook to sync changes across posts and comments
 * @access  Private (requires authentication)
 */
router.put('/user/:userId', authMiddleware, uploadAvatar, updateUserProfile);

export default router;
