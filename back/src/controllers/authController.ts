import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

interface JWTPayload {
  user: {
    id: string;
  };
}

const ACCESS_TOKEN_COOKIE = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';
const AUTH_USER_COOKIE = 'authUser';
const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 60;
const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

const getCookieOptions = (maxAge: number, httpOnly = true) => ({
  httpOnly,
  sameSite: 'lax' as const,
  secure: process.env.USE_HTTPS === 'true',
  maxAge,
  path: '/',
});

const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  user: {
    id: string;
    username: string;
    email: string;
    profilePicture?: string | null;
  }
) => {
  res.cookie(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS)
  );
  res.cookie(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS)
  );
  res.cookie(
    AUTH_USER_COOKIE,
    JSON.stringify(user),
    getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS, false)
  );
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS));
  res.clearCookie(REFRESH_TOKEN_COOKIE, getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS));
  res.clearCookie(AUTH_USER_COOKIE, getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS, false));
};

const getCookieValue = (req: Request, cookieName: string) => {
  const rawCookies = req.headers.cookie;

  if (!rawCookies) {
    return null;
  }

  for (const cookie of rawCookies.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=');

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
};

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

    // Generate JWT Access Token
    const accessPayload: JWTPayload = {
      user: {
        id: user._id.toString(),
      },
    };

    const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    // Generate JWT Refresh Token (longer expiry)
    const refreshToken = jwt.sign(accessPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    // Push refresh token to user's refreshTokens array and save
    user.refreshTokens.push(refreshToken);
    await user.save();

    const responseUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    setAuthCookies(res, accessToken, refreshToken, responseUser);

    res.status(201).json({
      user: responseUser,
      msg: 'User registered successfully',
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

    // Check if user is a Google OAuth user (no password set)
    if (!user.password && user.googleId) {
      res.status(400).json({ msg: 'This account uses Google Sign-In. Please use the Google login option.' });
      return;
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({ msg: 'Invalid Credentials' });
      return;
    }

    // Generate JWT Access Token
    const accessPayload: JWTPayload = {
      user: {
        id: user._id.toString(),
      },
    };

    const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    // Generate JWT Refresh Token (longer expiry)
    const refreshToken = jwt.sign(accessPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    // Push refresh token to user's refreshTokens array and save
    user.refreshTokens.push(refreshToken);
    await user.save();

    const responseUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    setAuthCookies(res, accessToken, refreshToken, responseUser);

    res.json({
      user: responseUser,
      msg: 'Login successful',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ msg: errorMessage });
  }
};

/**
 * @desc    Get current authenticated user
 * @access  Private (requires authentication)
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user!._id).lean();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
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
    res.cookie(
      AUTH_USER_COOKIE,
      JSON.stringify({
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
      }),
      getCookieOptions(REFRESH_TOKEN_MAX_AGE_MS, false)
    );

    res.json({
      msg: 'User profile updated successfully',
      user: {
        id: updatedUser._id.toString(),
        username: updatedUser.username,
        email: updatedUser.email,
        profilePicture: updatedUser.profilePicture,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Refresh access token using refresh token
 * @access  Public
 * @details Verifies refresh token, checks if it exists in user's refreshTokens[] array,
 *          and returns a new access token if valid
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const providedRefreshToken =
    getCookieValue(req, REFRESH_TOKEN_COOKIE) || req.body.refreshToken;

  // Basic validation
  if (!providedRefreshToken) {
    res.status(400).json({ msg: 'Refresh token is required' });
    return;
  }

  try {
    // Verify the refresh token signature
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(
        providedRefreshToken,
        process.env.JWT_REFRESH_SECRET || (process.env.JWT_SECRET as string)
      ) as JWTPayload;
    } catch (tokenError) {
      res.status(401).json({ msg: 'Invalid or expired refresh token' });
      return;
    }

    // Find the user by ID from token payload
    const user = await User.findById(decoded.user.id);
    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    // Check if the refresh token exists in user's refreshTokens array
    if (!user.refreshTokens.includes(providedRefreshToken)) {
      res.status(401).json({ msg: 'Refresh token not found in user record. Please login again.' });
      return;
    }

    // Generate new access token
    const accessPayload: JWTPayload = {
      user: {
        id: user._id.toString(),
      },
    };

    const newAccessToken = jwt.sign(accessPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.cookie(
      ACCESS_TOKEN_COOKIE,
      newAccessToken,
      getCookieOptions(ACCESS_TOKEN_MAX_AGE_MS)
    );

    res.json({
      msg: 'Access token refreshed successfully',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ msg: errorMessage });
  }
};

/**
 * @desc    Logout user
 * @access  Private (requires authentication)
 * @details Removes the current refresh token from user's refreshTokens[] array
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  const providedRefreshToken =
    getCookieValue(req, REFRESH_TOKEN_COOKIE) || req.body.refreshToken;

  try {
    const userId = req.user!._id;

    // If refresh token is provided, remove it from the user's refreshTokens array
    if (providedRefreshToken) {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Remove the refresh token from the array
      user.refreshTokens = user.refreshTokens.filter(token => token !== providedRefreshToken);
      await user.save();
    }

    clearAuthCookies(res);

    res.json({ msg: 'User logged out successfully' });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Server error';
    console.error(errorMessage);
    res.status(500).json({ error: errorMessage });
  }
};

/**
 * @desc    Google Login / Signup
 * @access  Public
 * @details Verifies Google ID token and creates or updates user
 */
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  console.log('[Google Login] Request received');
  const { credential } = req.body;

  // Validate credential
  if (!credential) {
    console.error('[Google Login] Missing credential in request');
    res.status(400).json({ msg: 'Google credential (ID token) is required' });
    return;
  }

  try {
    console.log('[Google Login] Step 1: Verifying ID token with Google');
    
    // Validate environment variables
    if (!process.env.GOOGLE_CLIENT_ID) {
      throw new Error('GOOGLE_CLIENT_ID environment variable is not set');
    }
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    // Initialize Google OAuth2 client
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // Verify the ID token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (tokenError) {
      const tokenErrorMsg = tokenError instanceof Error ? tokenError.message : 'Token verification failed';
      console.error('[Google Login] Token verification failed:', tokenErrorMsg);
      res.status(401).json({ msg: `Token verification failed: ${tokenErrorMsg}` });
      return;
    }

    console.log('[Google Login] Step 2: Token verified successfully');

    const payload = ticket.getPayload();
    if (!payload) {
      console.error('[Google Login] Payload is empty or undefined');
      res.status(400).json({ msg: 'Invalid Google token: No payload' });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

    // Validate required fields
    if (!googleId || !email) {
      console.error('[Google Login] Missing required fields - googleId:', googleId, 'email:', email);
      res.status(400).json({ msg: 'Invalid Google token: Missing googleId or email' });
      return;
    }

    console.log('[Google Login] Step 3: Token payload extracted - email:', email, 'googleId:', googleId);

    // Upsert: Find user by email or googleId
    console.log('[Google Login] Step 4: Checking if user exists by email or googleId');
    let user: any = await User.findOne({
      $or: [{ email }, { googleId }],
    });

    if (user) {
      console.log('[Google Login] Step 5a: User found - updating googleId and profile picture');
      // User exists: Update googleId and profile picture if provided
      const updateData: Record<string, string> = { googleId };
      if (picture) {
        updateData.profilePicture = picture;
        console.log('[Google Login] Updating profilePicture from Google:', picture);
      }
      
      try {
        user = await User.findByIdAndUpdate(user._id, updateData, {
          new: true,
          runValidators: false, // Avoid validation issues during update
        });
        console.log('[Google Login] User updated successfully');
      } catch (updateError) {
        const updateErrorMsg = updateError instanceof Error ? updateError.message : 'Unknown error';
        console.error('[Google Login] Failed to update existing user:', updateErrorMsg);
        throw updateError;
      }
    } else {
      console.log('[Google Login] Step 5b: User not found - creating new user');
      // New user: Create account with Google information
      let newUsername = name || email.split('@')[0] || `user_${Date.now()}`;
      console.log('[Google Login] Desired username:', newUsername);

      // Check if username already exists and generate unique one if needed
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
        console.log('[Google Login] Username already exists, appending timestamp');
        newUsername = `${newUsername}_${Date.now()}`;
        console.log('[Google Login] New unique username:', newUsername);
      }

      console.log('[Google Login] Creating user with username:', newUsername, 'email:', email);

      try {
        user = new User({
          username: newUsername,
          email,
          googleId,
          profilePicture: picture || null,
          // Password is not required for Google login users
        });

        console.log('[Google Login] New user object created, saving to database');
        await user.save();
        console.log('[Google Login] New user saved successfully');
      } catch (createError) {
        const createErrorMsg = createError instanceof Error ? createError.message : 'Unknown error';
        console.error('[Google Login] Failed to create new user:', createErrorMsg);
        console.error('[Google Login] Error details:', createError);
        throw createError;
      }
    }

    console.log('[Google Login] Step 6: Generating JWT tokens');

    // Generate JWT Access Token
    const accessPayload: JWTPayload = {
      user: {
        id: user._id.toString(),
      },
    };

    const accessToken = jwt.sign(accessPayload, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    // Generate JWT Refresh Token (longer expiry)
    const refreshToken = jwt.sign(accessPayload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET as string, {
      expiresIn: '7d',
    });

    console.log('[Google Login] Step 6b: Pushing refresh token to user refreshTokens array');

    // Push refresh token to user's refreshTokens array and save
    user.refreshTokens.push(refreshToken);
    await user.save();

    console.log('[Google Login] JWT tokens generated successfully');
    console.log('[Google Login] Step 7: Sending response');

    const responseUser = {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
    };

    setAuthCookies(res, accessToken, refreshToken, responseUser);

    res.json({
      user: responseUser,
      msg: 'Google login successful',
    });

    console.log('[Google Login] Response sent successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('[Google Login] FATAL ERROR:', errorMessage);
    console.error('[Google Login] Error stack:', errorStack);
    console.error('[Google Login] Full error object:', error);

    // Only send response if not already sent
    if (!res.headersSent) {
      res.status(500).json({ 
        msg: `Google login failed: ${errorMessage}`,
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      });
    }
  }
};
