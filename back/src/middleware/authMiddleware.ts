import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * UserSub Sub-Schema type for embedding in requests
 */
interface UserSub {
  _id: string;
  username: string;
  profilePicture: string | null;
}

/**
 * Extended Express Request with authenticated user
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserSub;
    }
  }
}

/**
 * JWT Payload interface
 */
interface JWTPayload {
  user: {
    id: string;
  };
  iat?: number;
  exp?: number;
}

const ACCESS_TOKEN_COOKIE = 'accessToken';

const getCookieValue = (cookieHeader: string | undefined, cookieName: string) => {
  if (!cookieHeader) {
    return null;
  }

  for (const cookie of cookieHeader.split(';')) {
    const [name, ...valueParts] = cookie.trim().split('=');

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
};

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user sub-schema to req.user
 *
 * @param req Express Request with Authorization header
 * @param res Express Response
 * @param next Express NextFunction
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const tokenFromHeader =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : null;
    const tokenFromCookie = getCookieValue(req.headers.cookie, ACCESS_TOKEN_COOKIE);
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      res.status(401).json({ error: 'No token provided. Authorization required.' });
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTPayload;

    // Fetch user from database
    const user = await User.findById(decoded.user.id);
    if (!user) {
      res.status(401).json({ error: 'User not found. Token invalid.' });
      return;
    }

    // Attach UserSub schema to request
    req.user = {
      _id: user._id.toString(),
      username: user.username,
      profilePicture: user.profilePicture,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired. Please login again.' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token format or signature.' });
    } else {
      const errorMessage = error instanceof Error ? error.message : 'Authentication error';
      res.status(500).json({ error: errorMessage });
    }
  }
};

export default authMiddleware;
