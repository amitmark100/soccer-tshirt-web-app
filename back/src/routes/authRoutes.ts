import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import authMiddleware from '../middleware/authMiddleware';

const router = Router();

interface JWTPayload {
  user: {
    id: string;
  };
}

/**
 * @route   POST /api/auth/register
 * @desc    Register user
 * @access  Public
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  // Basic validation
  if (!username || !email || !password) {
    res.status(400).json({ msg: 'Please enter all fields' });
    return;
  }

  try {
    // Check for existing user by email
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ msg: 'User with this email already exists' });
      return;
    }

    // Check for existing user by username
    user = await User.findOne({ username });
    if (user) {
      res.status(400).json({ msg: 'User with this username already exists' });
      return;
    }

    user = new User({
      username,
      email,
      password,
    });

    await user.save();

    // Generate JWT token
    const payload: JWTPayload = {
      user: {
        id: user._id.toString(),
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ msg: errorMessage });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Basic validation
  if (!email || !password) {
    res.status(400).json({ msg: 'Please enter all fields' });
    return;
  }

  try {
    // Check if user exists and get password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(400).json({ msg: 'Invalid Credentials' });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid Credentials' });
      return;
    }

    // Generate JWT token
    const payload: JWTPayload = {
      user: {
        id: user._id.toString(),
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ msg: errorMessage });
  }
});

/**
 * @route   PUT /api/auth/user/:userId
 * @desc    Update user profile (username and/or profilePicture)
 * @desc    Triggers middleware hook to sync changes across posts and comments
 * @access  Private (requires authentication)
 */
router.put('/user/:userId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { username, profilePicture } = req.body;

    // Check that user can only update their own profile
    if (userId !== req.user!._id) {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }

    // At least one field must be provided
    if (!username && !profilePicture) {
      res.status(400).json({ error: 'Please provide username and/or profilePicture to update' });
      return;
    }

    // Prepare update object
    const updateFields: Record<string, string | null> = {};
    if (username) {
      updateFields.username = username;
    }
    if (profilePicture !== undefined) {
      updateFields.profilePicture = profilePicture;
    }

    // Update user (this triggers the post-findOneAndUpdate middleware)
    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return updated user info (without password)
    res.json({
      msg: 'User profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
});

export default router;
