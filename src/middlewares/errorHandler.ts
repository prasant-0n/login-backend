import express, { NextFunction, Request, Response } from "express";
import { AppConfig } from "../config/app";


/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    public statusCode: number;
    public isOperational: boolean;

    constructor(message: string, statusCode: number = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}


/**
 * Not found error
 */

export class NotFoundError extends ApiError {
    constructor(message: string = "Resource not found") {
        super(message, 404);
    }
}


/**
 * Bad request error
 */

export class BadRequestError extends ApiError {
    constructor(message: string = "Bad request") {
        super(message, 400);
    }
}


/**
 * Unauthorized error
 */
export class UnauthorizedError extends ApiError {
    constructor(message: string = "Unauthorized") {
        super(message, 401);
    }
}


/**
 * Forbidden error
 */

export class ForbiddenError extends ApiError {
    constructor(message: string = "Forbidden") {
        super(message, 403);
    }
}


/**
 * Conflict error
 */

export class ConflictError extends ApiError {
    constructor(message: string = "Conflict") {
        super(message, 409);
    }
}


/**
 * Validation error
 */

export class ValidationError extends ApiError {
    constructor(message: string = "Validation error") {
        super(message, 422);
    }
}

/**
 * Global error handler middleware
 */

export const errorHandler = (
    error: Error,
    _req: Request,
    _res: Response,
    _next: NextFunction
): void => {
    const config = AppConfig.getInstance();
    const isDevelopement = config.isDevelopment();

    let statusCode = 500;
    let message = isDevelopement ? error.message : "Internal Server Error";

    let details: any = null;
    if (error instanceof ApiError) {
        statusCode = error.statusCode;
        message = error.message;
    }

    // Handle Mongoose validation errors
    else if (error.name === "ValidationError") {
        statusCode = 400;
        message = 'Validation failed';
        details = Object.values((error as any).errors).map((err: any) => ({
            field: err.path,
            message: err.message,
            value: err.value
        }));
    }
    // Handle Mongoose duplicate key errors
    else if (error.name === 'MongoError' && (error as any).code === 11000) {
        statusCode = 409;
        message = 'Duplicate field value';
        const field = Object.keys((error as any).keyPattern)[0];
        details = field ? { field, value: (error as any).keyValue?.[field] } : undefined;
    }

    else if (error.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token";
    } else if (error.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired";
    }


    //Log the error details in development mode
    console.log("Error details:", {
        message: error.message,
        stack: error.stack,
        url: _req.url,
        moethod: _req.method,
        ip: _req.ip,
        userAgent: _req.get("User-Agent"),
        timeStamp: new Date().toISOString(),
    });


    //Prepare the response

    const response: any = {
        success: false,
        message,
        error: isDevelopement ? error.message : message
    }

    // Add details in development

    if (isDevelopement && error.stack) response.stack = error.stack;
    _res.status(statusCode).json(response);

}


// 404 handler for undefined routes

export const notFoundhandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const error = new NotFoundError(`${req.originalUrl} not found`);
    next(error);
}



/**
 * Async error wrapper
 * Wraps async route handlers to catch unhandled promise rejections
 */

export const asyncHandler = (fn: express.RequestHandler): express.RequestHandler => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}


/**
 * Request logger middleware
 */

export const requestLogger = (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
): void => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';

        console.log(`${logLevel} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });

    next();

}

// Error handling middleware for Express.js
export const securityHeaders = (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; frame-ancestors 'none'");

    next();
};