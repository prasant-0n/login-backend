import nodemailer from 'nodemailer';
import { EmailOptions, EmailTemplate } from '../types';
import { AppConfig } from '../config/app';

/**
 * Email Service
 * Handles email sending for verification and password reset
 */
export class EmailService {
    private static instance: EmailService;
    private config = AppConfig.getInstance().getConfig();
    private transporter: nodemailer.Transporter;

    private constructor() {
        this.transporter = nodemailer.createTransport({
            host: this.config.email.host,
            port: this.config.email.port,
            secure: false, // true for 465, false for other ports
            auth: {
                user: this.config.email.user,
                pass: this.config.email.pass,
            },
        });
    }

    public static getInstance(): EmailService {
        if (!EmailService.instance) {
            EmailService.instance = new EmailService();
        }
        return EmailService.instance;
    }

    /**
     * Send email
     */
    public async sendEmail(options: EmailOptions): Promise<void> {
        try {
            const mailOptions = {
                from: this.config.email.from,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || this.htmlToText(options.html),
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 Email sent successfully:', info.messageId);
        } catch (error) {
            console.error('❌ Email sending failed:', error);
            throw new Error('Failed to send email');
        }
    }

    /**
     * Send email verification
     */
    public async sendEmailVerification(email: string, token: string, firstName: string): Promise<void> {
        const verificationUrl = `${this.config.baseUrl}/api/auth/verify-email?token=${token}`;

        const template = this.getEmailVerificationTemplate(firstName, verificationUrl);

        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }

    /**
     * Send password reset email
     */
    public async sendPasswordReset(email: string, token: string, firstName: string): Promise<void> {
        const resetUrl = `${this.config.baseUrl}/api/auth/reset-password?token=${token}`;

        const template = this.getPasswordResetTemplate(firstName, resetUrl);

        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }

    /**
     * Send welcome email
     */
    public async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
        const template = this.getWelcomeTemplate(firstName);

        await this.sendEmail({
            to: email,
            subject: template.subject,
            html: template.html,
            text: template.text,
        });
    }

    /**
     * Get email verification template
     */
    private getEmailVerificationTemplate(firstName: string, verificationUrl: string): EmailTemplate {
        return {
            subject: 'Verify Your Email - AuthX',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AuthX!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for registering with AuthX! To complete your registration, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              
              <p>This link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with AuthX, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AuthX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Welcome to AuthX!
        
        Hi ${firstName},
        
        Thank you for registering with AuthX! To complete your registration, please verify your email address by visiting the following link:
        
        ${verificationUrl}
        
        This link will expire in 24 hours for security reasons.
        
        If you didn't create an account with AuthX, you can safely ignore this email.
        
        Best regards,
        The AuthX Team
      `
        };
    }

    /**
     * Get password reset template
     */
    private getPasswordResetTemplate(firstName: string, resetUrl: string): EmailTemplate {
        return {
            subject: 'Reset Your Password - AuthX',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>We received a request to reset your password for your AuthX account. Click the button below to create a new password:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
              
              <div class="warning">
                <strong>Important:</strong> This link will expire in 10 minutes for security reasons. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </div>
              
              <p>If you didn't request this password reset, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AuthX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Password Reset Request - AuthX
        
        Hi ${firstName},
        
        We received a request to reset your password for your AuthX account. Please visit the following link to create a new password:
        
        ${resetUrl}
        
        Important: This link will expire in 10 minutes for security reasons.
        
        If you didn't request this password reset, you can safely ignore this email or contact support if you have concerns.
        
        Best regards,
        The AuthX Team
      `
        };
    }

    /**
     * Get welcome email template
     */
    private getWelcomeTemplate(firstName: string): EmailTemplate {
        return {
            subject: 'Welcome to AuthX!',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AuthX</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to AuthX!</h1>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Welcome to AuthX! Your account has been successfully created and verified.</p>
              
              <p>You now have access to all the features of our authentication system:</p>
              <ul>
                <li>Secure login and registration</li>
                <li>OAuth integration with multiple providers</li>
                <li>Password reset functionality</li>
                <li>Email verification</li>
                <li>Role-based access control</li>
              </ul>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
              
              <p>Thank you for choosing AuthX!</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 AuthX. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Welcome to AuthX!
        
        Hi ${firstName},
        
        Welcome to AuthX! Your account has been successfully created and verified.
        
        You now have access to all the features of our authentication system:
        - Secure login and registration
        - OAuth integration with multiple providers
        - Password reset functionality
        - Email verification
        - Role-based access control
        
        If you have any questions or need assistance, please don't hesitate to contact our support team.
        
        Thank you for choosing AuthX!
        
        Best regards,
        The AuthX Team
      `
        };
    }

    /**
     * Convert HTML to plain text
     */
    private htmlToText(html: string): string {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .trim();
    }

    /**
     * Verify email configuration
     */
    public async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            console.log('✅ Email service configured successfully');
            return true;
        } catch (error) {
            console.error('❌ Email service configuration failed:', error);
            return false;
        }
    }
} 