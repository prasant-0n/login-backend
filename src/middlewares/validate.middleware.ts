import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

/**
 * Validation error handler middleware
 * Processes validation errors and returns formatted response
 */
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);


    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: (error as any).path || (error as any).param,
            message: error.msg,
            value: (error as any).value
        }));

        res.status(400).json({
            success: false,
            message: 'Validation failed',
            error: 'Invalid input data',
            details: errorMessages
        });
        return;
    }

    next();
};

/**
 * Registration validation rules
 */
export const validateRegistration = (): ValidationChain[] => [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('firstName')
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .trim()
        .escape(),

    body('lastName')
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .trim()
        .escape()
];

/**
 * Login validation rules
 */
export const validateLogin = (): ValidationChain[] => [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Password reset validation rules
 */
export const validatePasswordReset = (): ValidationChain[] => [
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match password');
            }
            return true;
        })
];

/**
 * Forgot password validation rules
 */
export const validateForgotPassword = (): ValidationChain[] => [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim()
];

/**
 * Email verification validation rules
 */
export const validateEmailVerification = (): ValidationChain[] => [
    body('token')
        .notEmpty()
        .withMessage('Verification token is required')
        .trim()
];

/**
 * Profile update validation rules
 */
export const validateProfileUpdate = (): ValidationChain[] => [
    body('firstName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .trim()
        .escape(),

    body('lastName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .trim()
        .escape(),

    body('avatar')
        .optional()
        .isURL()
        .withMessage('Avatar must be a valid URL')
];

/**
 * Admin user update validation rules
 */
export const validateAdminUserUpdate = (): ValidationChain[] => [
    body('role')
        .optional()
        .isIn(['user', 'admin'])
        .withMessage('Role must be either "user" or "admin"'),

    body('isEmailVerified')
        .optional()
        .isBoolean()
        .withMessage('isEmailVerified must be a boolean value')
];

/**
 * Pagination validation rules
 */
export const validatePagination = (): ValidationChain[] => [
    body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),

    body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

/**
 * Search validation rules
 */
export const validateSearch = (): ValidationChain[] => [
    body('query')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be between 1 and 100 characters')
        .trim()
        .escape()
];

/**
 * Generic string validation
 */
export const validateString = (fieldName: string, minLength: number = 1, maxLength: number = 100): ValidationChain[] => [
    body(fieldName)
        .isLength({ min: minLength, max: maxLength })
        .withMessage(`${fieldName} must be between ${minLength} and ${maxLength} characters`)
        .trim()
        .escape()
];

/**
 * Generic email validation
 */
export const validateEmail = (fieldName: string = 'email'): ValidationChain[] => [
    body(fieldName)
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim()
];

/**
 * Generic password validation
 */
export const validatePassword = (fieldName: string = 'password'): ValidationChain[] => [
    body(fieldName)
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
]; 