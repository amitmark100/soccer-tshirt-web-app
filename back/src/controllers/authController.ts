import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JWTPayload {
  user: {
    id: string;
  };
}

/**
 * @desc    Register user
 * @access  Public
 */
export const register = async (req: Request, res: Response): Promise<void> => {
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
};

/**
 * @desc    Authenticate user & get token
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
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
};

/**
 * @desc    Update user profile (username and/or profilePicture)
 * @desc    Triggers middleware hook to sync changes across posts and comments
 * @access  Private (requires authentication)
 */
export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    // Check that user can only update their own profile
    if (userId !== req.user!._id) {
      res.status(403).json({ error: 'You can only update your own profile' });
      return;
    }

    // At least one field must be provided
    if (!username && !req.file) {
      res.status(400).json({ error: 'Please provide username and/or avatar to update' });
      return;
    }

    // Prepare update object
    const updateFields: Record<string, string | null> = {};
    if (username) {
      updateFields.username = username;
    }
    if (req.file) {
      updateFields.profilePicture = `/uploads/${req.file.filename}`;
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
};

/**
 * @desc    Logout user
 * @access  Private (requires authentication)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({ msg: 'User logged out successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};
