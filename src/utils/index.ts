import crypto from 'crypto';

/**
 * Utility functions for common operations
 */

/**
 * Generate a random token
 */
export const generateRandomToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random string
 */
export const generateRandomString = (length: number = 10): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

/**
 * Hash a string using SHA-256
 */
export const hashString = (str: string): string => {
    return crypto.createHash('sha256').update(str).digest('hex');
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password strength
 */
export const isStrongPassword = (password: string): boolean => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

/**
 * Sanitize user input
 */
export const sanitizeInput = (input: string): string => {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
    return date.toISOString();
};

/**
 * Get current timestamp
 */
export const getCurrentTimestamp = (): number => {
    return Date.now();
};

/**
 * Calculate time difference in minutes
 */
export const getTimeDifferenceInMinutes = (date1: Date, date2: Date): number => {
    return Math.floor((date2.getTime() - date1.getTime()) / (1000 * 60));
};

/**
 * Check if a date is expired
 */
export const isExpired = (date: Date): boolean => {
    return date < new Date();
};

/**
 * Generate pagination metadata
 */
export const generatePaginationMeta = (
    page: number,
    limit: number,
    totalItems: number
) => {
    const totalPages = Math.ceil(totalItems / limit);
    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

/**
 * Extract domain from email
 */
export const extractDomainFromEmail = (email: string): string => {
    return email.split('@')[1] || '';
};

/**
 * Mask email for privacy
 */
export const maskEmail = (email: string): string => {
    const parts = email.split('@');
    const localPart = parts[0];
    const domain = parts[1];

    if (!localPart || !domain || localPart.length <= 2) return email;

    const maskedLocal = localPart.charAt(0) + '*'.repeat(localPart.length - 2) + localPart.charAt(localPart.length - 1);
    return `${maskedLocal}@${domain}`;
};

/**
 * Generate initials from name
 */
export const generateInitials = (firstName: string, lastName: string): string => {
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    return `${firstInitial}${lastInitial}`;
};

/**
 * Validate URL format
 */
export const isValidUrl = (url: string): boolean => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Convert bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generate a slug from text
 */
export const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};

/**
 * Check if string contains only alphanumeric characters
 */
export const isAlphanumeric = (str: string): boolean => {
    return /^[a-zA-Z0-9]+$/.test(str);
};

/**
 * Generate a UUID v4
 */
export const generateUUID = (): string => {
    return crypto.randomUUID();
}; 