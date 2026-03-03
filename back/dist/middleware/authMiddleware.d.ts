import { Request, Response, NextFunction } from 'express';
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
 * Authentication Middleware
 * Verifies JWT token and attaches user sub-schema to req.user
 *
 * @param req Express Request with Authorization header
 * @param res Express Response
 * @param next Express NextFunction
 */
export declare const authMiddleware: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default authMiddleware;
//# sourceMappingURL=authMiddleware.d.ts.map