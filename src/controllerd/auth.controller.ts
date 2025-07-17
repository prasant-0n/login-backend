import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { JWTService } from '../services/jwt.service';
import { EmailService } from '../services/email.service';
import { AuthenticatedRequest, AuthResponse, UserRole, OAuthProvider } from '../types';
import { BadRequestError, ConflictError, UnauthorizedError } from '../middlewares/errorHandler';
import { asyncHandler } from '../middlewares/errorHandler';

/**
 * Authentication Controller
 * Handles user registration, login, logout, and password management
 */
export class AuthController {
  private jwtService = JWTService.getInstance();
  private emailService = EmailService.getInstance();

  /**
   * Register a new user
   * POST /api/auth/register
   */
  public register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role: UserRole.USER
    });

    await user.save();

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Send verification email
    try {
      await this.emailService.sendEmailVerification(email, verificationToken, firstName);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair(user);

    // Add refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const response: AuthResponse = {
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar || undefined
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: response
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  public login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    // Find user by email with password
    const user = await User.findByEmail(email).select('+password +refreshTokens'); if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair(user);

    // Add refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const response: AuthResponse = {
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: response
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  public logout = asyncHandler(async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    console.log("🔁 Logout route triggered"); // Add this line

    const user = req.user;
    if (!user) {
      throw new UnauthorizedError('User not authenticated');
    }

    // Clear all tokens
    user.clearTokens();
    await user.save();
    console.log('User authenticated for logout:', user.email);


    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  });

  /**
   * Refresh access token
   * GET /api/auth/refresh-token
   */
  public refreshToken = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies['refreshToken'] || req.headers['x-refresh-token'];

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    // Verify refresh token
    const decoded = this.jwtService.verifyRefreshToken(refreshToken as string);

    // Find user with refresh token
    const user = await User.findById(decoded.userId).select('+refreshTokens');
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Check if refresh token exists in user's tokens
    if (!user.refreshTokens.includes(refreshToken as string)) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generate new tokens
    const newTokens = this.jwtService.generateTokenPair(user);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter((token: string) => token !== refreshToken);
    user.refreshTokens.push(newTokens.refreshToken);
    await user.save();

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', newTokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken
      }
    });
  });

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  public verifyEmail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token } = req.body;

    if (!token) {
      throw new BadRequestError('Verification token is required');
    }

    // Find user by verification token
    const user = await User.findByVerificationToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired verification token');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email
    try {
      await this.emailService.sendWelcomeEmail(user.email, user.firstName);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  });

  /**
   * Forgot password
   * POST /api/auth/forgot-password
   */
  public forgotPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;

    // Find user by email
    const user = await User.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent'
      });
      return;
    }

    // Generate password reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Send password reset email
    try {
      await this.emailService.sendPasswordReset(email, resetToken, user.firstName);
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  });

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  public resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new BadRequestError('Token and new password are required');
    }

    // Find user by password reset token
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Clear all refresh tokens (force re-login)
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.'
    });
  });

  /**
   * OAuth callback handler
   * GET /api/auth/oauth/:provider/callback
   */
  public oauthCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { provider } = req.params;
    const { profile } = req.user as any;

    if (!profile) {
      throw new BadRequestError('OAuth profile not found');
    }

    // Find or create user
    let user = await User.findByOAuth(provider as OAuthProvider, profile.id);

    if (!user) {
      // Check if user exists with email
      const email = profile.emails?.[0]?.value;
      if (email) {
        user = await User.findByEmail(email);
        if (user) {
          // Link OAuth account to existing user
          user.oauthProvider = provider as OAuthProvider;
          user.oauthId = profile.id;
          if (profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
        }
      }

      if (!user) {
        // Create new user
        user = new User({
          email: profile.emails?.[0]?.value,
          password: Math.random().toString(36).slice(-10), // Random password for OAuth users
          firstName: profile.displayName?.split(' ')[0] || 'User',
          lastName: profile.displayName?.split(' ').slice(1).join(' ') || '',
          oauthProvider: provider as OAuthProvider,
          oauthId: profile.id,
          isEmailVerified: true, // OAuth users are pre-verified
          avatar: profile.photos?.[0]?.value
        });
        await user.save();
      }
    }

    // Generate tokens
    const tokens = this.jwtService.generateTokenPair(user);

    // Add refresh token to user
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    const response: AuthResponse = {
      user: {
        _id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      }
    };

    res.status(200).json({
      success: true,
      message: 'OAuth login successful',
      data: response
    });
  });
} 