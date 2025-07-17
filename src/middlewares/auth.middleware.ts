import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, UserRole } from '../types';
import { JWTService } from '../services/jwt.service';
import { User } from '../models/user.model';

/**
 * Authentication middleware
 * Validates JWT access token and attaches user to request
 */
export const authenticate = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                message: 'Access token required',
                error: 'No authorization header provided'
            });
            return;
        }

        const token = JWTService.getInstance().extractTokenFromHeader(authHeader);

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Invalid authorization header format',
                error: 'Token must be provided in format: Bearer <token>'
            });
            return;
        }

        // Verify the access token
        const decoded = JWTService.getInstance().verifyAccessToken(token);

        // Find user by ID
        const user = await User.findById(decoded.userId).select('+refreshTokens');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
                error: 'Invalid token - user does not exist'
            });
            return;
        }

        // Check if user is active (not deleted)
        if (!user._id) {
            res.status(401).json({
                success: false,
                message: 'User account is inactive',
                error: 'Account has been deactivated'
            });
            return;
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Authentication failed',
            error: 'Invalid or expired access token'
        });
    }
};

/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
export const authorize = (...roles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required',
                error: 'User not authenticated'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied',
                error: `Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`
            });
            return;
        }

        next();
    };
};

/**
 * Admin authorization middleware
 * Shortcut for admin-only routes
 */
export const requireAdmin = authorize(UserRole.ADMIN);

/**
 * Email verification middleware
 * Ensures user has verified their email
 */
export const requireEmailVerification = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            message: 'Authentication required',
            error: 'User not authenticated'
        });
        return;
    }

    if (!req.user.isEmailVerified) {
        res.status(403).json({
            success: false,
            message: 'Email verification required',
            error: 'Please verify your email address before accessing this resource'
        });
        return;
    }

    next();
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return next();
        }

        const token = JWTService.getInstance().extractTokenFromHeader(authHeader);

        if (!token) {
            return next();
        }

        // Verify the access token
        const decoded = JWTService.getInstance().verifyAccessToken(token);

        // Find user by ID
        const user = await User.findById(decoded.userId);

        if (user) {
            req.user = user;
        }

        next();

    } catch (error) {
        // Don't throw error for optional auth, just continue
        next();
    }
}; 