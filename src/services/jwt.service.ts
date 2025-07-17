import jwt from 'jsonwebtoken';
import { JWTPayload, TokenPair, IUser } from '../types';
import { AppConfig } from '../config/app';

/**
 * JWT Service
 * Handles token generation, validation, and management
 */
export class JWTService {
    private static instance: JWTService;
    private config = AppConfig.getInstance().getConfig();

    private constructor() { }

    public static getInstance(): JWTService {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }
        return JWTService.instance;
    }

    /**
     * Generate access token
     */
    public generateAccessToken(user: IUser): string {
        const payload: JWTPayload = {
            userId: user._id,
            email: user.email,
            role: user.role,
            type: 'access'
        };

        return jwt.sign(payload, this.config.jwt.accessSecret, {
            expiresIn: this.config.jwt.accessExpiresIn
        } as jwt.SignOptions);
    }

    /**
     * Generate refresh token
     */
    public generateRefreshToken(user: IUser): string {
        const payload: JWTPayload = {
            userId: user._id,
            email: user.email,
            role: user.role,
            type: 'refresh'
        };

        return jwt.sign(payload, this.config.jwt.refreshSecret, {
            expiresIn: this.config.jwt.refreshExpiresIn
        } as jwt.SignOptions);
    }

    /**
     * Generate both access and refresh tokens
     */
    public generateTokenPair(user: IUser): TokenPair {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user)
        };
    }

    /**
     * Verify access token
     */
    public verifyAccessToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(token, this.config.jwt.accessSecret) as JWTPayload;

            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid access token');
        }
    }

    /**
     * Verify refresh token
     */
    public verifyRefreshToken(token: string): JWTPayload {
        try {
            const decoded = jwt.verify(token, this.config.jwt.refreshSecret) as JWTPayload;

            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }

            return decoded;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Decode token without verification (for logging/debugging)
     */
    public decodeToken(token: string): any {
        try {
            return jwt.decode(token);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get token expiration time
     */
    public getTokenExpiration(token: string): Date | null {
        try {
            const decoded = jwt.decode(token) as any;
            if (decoded && decoded.exp) {
                return new Date(decoded.exp * 1000);
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if token is expired
     */
    public isTokenExpired(token: string): boolean {
        const expiration = this.getTokenExpiration(token);
        if (!expiration) return true;
        return expiration < new Date();
    }

    /**
     * Extract token from authorization header
     */
    public extractTokenFromHeader(authHeader: string): string | null {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7);
    }

    /**
     * Generate token for email verification
     */
    public generateEmailVerificationToken(userId: string): string {
        return jwt.sign(
            { userId, type: 'email-verification' },
            this.config.jwt.accessSecret,
            { expiresIn: '24h' }
        );
    }

    /**
     * Generate token for password reset
     */
    public generatePasswordResetToken(userId: string): string {
        return jwt.sign(
            { userId, type: 'password-reset' },
            this.config.jwt.accessSecret,
            { expiresIn: '10m' }
        );
    }

    /**
     * Verify email verification token
     */
    public verifyEmailVerificationToken(token: string): { userId: string } {
        try {
            const decoded = jwt.verify(token, this.config.jwt.accessSecret) as any;

            if (decoded.type !== 'email-verification') {
                throw new Error('Invalid token type');
            }

            return { userId: decoded.userId };
        } catch (error) {
            throw new Error('Invalid email verification token');
        }
    }

    /**
     * Verify password reset token
     */
    public verifyPasswordResetToken(token: string): { userId: string } {
        try {
            const decoded = jwt.verify(token, this.config.jwt.accessSecret) as any;

            if (decoded.type !== 'password-reset') {
                throw new Error('Invalid token type');
            }

            return { userId: decoded.userId };
        } catch (error) {
            throw new Error('Invalid password reset token');
        }
    }
} 