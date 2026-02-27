"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
/**
 * Authentication Middleware
 * Verifies JWT token and attaches user sub-schema to req.user
 *
 * @param req Express Request with Authorization header
 * @param res Express Response
 * @param next Express NextFunction
 */
const authMiddleware = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided. Authorization required.' });
            return;
        }
        const token = authHeader.substring(7); // Remove "Bearer " prefix
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Fetch user from database
        const user = await User_1.default.findById(decoded.user.id);
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
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token format or signature.' });
        }
        else {
            const errorMessage = error instanceof Error ? error.message : 'Authentication error';
            res.status(500).json({ error: errorMessage });
        }
    }
};
exports.authMiddleware = authMiddleware;
exports.default = exports.authMiddleware;
//# sourceMappingURL=authMiddleware.js.map