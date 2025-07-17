import { Request } from 'express';

// User related types
export interface IUser {
    comparePassword(password: any): unknown;
    _id?: any; // Changed to optional and any to match Mongoose Document
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isEmailVerified: boolean;
    emailVerificationToken?: string | undefined;
    emailVerificationExpires?: Date | undefined;
    passwordResetToken?: string | undefined;
    passwordResetExpires?: Date | undefined;
    refreshTokens: string[];
    oauthProvider?: OAuthProvider | undefined;
    oauthId?: string | undefined;
    avatar?: string | undefined;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    USER = 'user',
    ADMIN = 'admin'
}

export enum OAuthProvider {
    GOOGLE = 'google',
    GITHUB = 'github',
    FACEBOOK = 'facebook',
    LINKEDIN = 'linkedin',
    TWITTER = 'twitter'
}

// JWT Token types
export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

// Request types
export interface AuthenticatedRequest extends Request {
    user?: any; // Will be UserDocument from mongoose
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface AuthResponse {
    user: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        isEmailVerified: boolean;
        avatar?: string | undefined;
    };
    tokens: TokenPair;
}

// Email types
export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export interface EmailTemplate {
    subject: string;
    html: string;
    text: string;
}

// Validation types
export interface ValidationError {
    field: string;
    message: string;
}

// OAuth Profile types
export interface OAuthProfile {
    id: string;
    displayName: string;
    emails: Array<{ value: string; verified?: boolean }>;
    photos?: Array<{ value: string }>;
    provider: OAuthProvider;
}

// Rate limiting types
export interface RateLimitConfig {
    windowMs: number;
    maxRequests: number;
}

// Environment configuration types
export interface Config {
    nodeEnv: string;
    port: number;
    baseUrl: string;
    mongoUri: string;
    jwt: {
        accessSecret: string;
        refreshSecret: string;
        accessExpiresIn: string;
        refreshExpiresIn: string;
    };
    email: {
        host: string;
        port: number;
        user: string;
        pass: string;
        from: string;
    };
    oauth: {
        google: {
            clientId: string;
            clientSecret: string;
        };
        github: {
            clientId: string;
            clientSecret: string;
        };
    };
    session: {
        secret: string;
    };
    rateLimit: RateLimitConfig;
    security: {
        corsOrigin: string;
        cookieSecure: boolean;
        cookieHttpOnly: boolean;
        cookieSameSite: string;
    };
} 