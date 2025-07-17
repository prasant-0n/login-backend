import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserRole, OAuthProvider } from '../types';
import { Types, QueryWithHelpers } from 'mongoose';


/**
 * User Document interface extending Mongoose Document
 */


export interface UserDocument extends IUser, Document {
    _id: Types.ObjectId;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateEmailVerificationToken(): string;
    generatePasswordResetToken(): string;
    clearTokens(): void;
}


export interface UserModel extends mongoose.Model<UserDocument> {
    findByEmail(email: string): QueryWithHelpers<UserDocument | null, UserDocument>;
    findByOAuth(provider: OAuthProvider, oauthId: string): QueryWithHelpers<UserDocument | null, UserDocument>;
    findByVerificationToken(token: string): QueryWithHelpers<UserDocument | null, UserDocument>;
    findByPasswordResetToken(token: string): QueryWithHelpers<UserDocument | null, UserDocument>;
}





/**
 * User Schema definition
 * Comprehensive user model with authentication and OAuth support
 */
const userSchema = new Schema<UserDocument>({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // Don't include password in queries by default
    },
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String,
        select: false
    },
    emailVerificationExpires: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    refreshTokens: [{
        type: String,
        select: false
    }],
    oauthProvider: {
        type: String,
        enum: Object.values(OAuthProvider),
        select: false
    },
    oauthId: {
        type: String,
        select: false
    },
    avatar: {
        type: String,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (_doc, ret) {
            ret['id'] = ret['_id'].toString();
            delete ret['_id'];
            delete ret['password'];
            delete ret['emailVerificationToken'];
            delete ret['emailVerificationExpires'];
            delete ret['passwordResetToken'];
            delete ret['passwordResetExpires'];
            delete ret['refreshTokens'];
            delete ret['oauthProvider'];
            delete ret['oauthId'];
            return ret;
        }
    }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ oauthProvider: 1, oauthId: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

/**
 * Pre-save middleware to hash password
 */
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

/**
 * Compare password with hashed password
 */
/**
 * Compare password with hashed password
 */
userSchema.methods['comparePassword'] = async function (candidatePassword: string): Promise<boolean> {
    try {
        return await bcrypt.compare(candidatePassword, this['password']);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

/**
 * Generate email verification token
 */
/**
 * Generate email verification token
 */
userSchema.methods['generateEmailVerificationToken'] = function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    this['emailVerificationToken'] = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    this['emailVerificationExpires'] = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return token;
};

/**
 * Generate password reset token
 */
/**
 * Generate password reset token
 */
userSchema.methods['generatePasswordResetToken'] = function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');

    this['passwordResetToken'] = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    this['passwordResetExpires'] = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return token;
};

/**
 * Clear all tokens (for logout)
 */
/**
 * Clear all tokens (for logout)
 */
userSchema.methods['clearTokens'] = function (): void {
    this['refreshTokens'] = [];
    this['emailVerificationToken'] = undefined;
    this['emailVerificationExpires'] = undefined;
    this['passwordResetToken'] = undefined;
    this['passwordResetExpires'] = undefined;
};






/**
 * Static method to find user by email
 */
/**
 * Static method to find user by email
 */
userSchema.statics['findByEmail'] = function (email: string) {
    return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static method to find user by OAuth provider and ID
 */
/**
 * Static method to find user by OAuth provider and ID
 */
userSchema.statics['findByOAuth'] = function (provider: OAuthProvider, oauthId: string) {
    return this.findOne({ oauthProvider: provider, oauthId });
};

/**
 * Static method to find user by verification token
 */
/**
 * Static method to find user by verification token
 */
userSchema.statics['findByVerificationToken'] = function (token: string) {
    const crypto = require('crypto');
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return this.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });
};

/**
 * Static method to find user by password reset token
 */
/**
 * Static method to find user by password reset token
 */
userSchema.statics['findByPasswordResetToken'] = function (token: string) {
    const crypto = require('crypto');
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    return this.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
};

export const User = mongoose.model<UserDocument, UserModel>('User', userSchema);
