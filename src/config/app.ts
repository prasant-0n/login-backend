import dotenv from 'dotenv';
import { Config } from '../types';

dotenv.config();



export class AppConfig {
    private static instance: AppConfig;
    private config: Config;
    security: any;
    jwt: any;

    private constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }

    public static getInstance(): AppConfig {
        if (!AppConfig.instance) {
            AppConfig.instance = new AppConfig();
        }
        return AppConfig.instance;
    }

    //  Load configuration from environment variables
    private loadConfig(): Config {
        return {
            nodeEnv: process.env['NODE_ENV'] || 'development',
            port: parseInt(process.env['PORT'] || '3000', 10),
            baseUrl: process.env['BASE_URL'] || 'http://localhost:3000',
            mongoUri: process.env['MONGO_URI'] || 'mongodb://localhost:27017/myapp',
            jwt: {
                accessSecret: process.env['JWT_ACCESS_SECRET'] || 'some-default-access-secret',
                refreshSecret: process.env['JWT_REFRESH_SECRET'] || 'some-default-refresh-secret',
                accessExpiresIn: process.env['JWT_ACCESS_EXPIRES_IN'] || '15m',
                refreshExpiresIn: process.env['JWT_REFRESH_EXPIRES_IN'] || '7d',
            },
            email: {
                host: process.env['EMAIL_HOST'] || 'smtp.example.com',
                port: parseInt(process.env['EMAIL_PORT'] || '587', 10), // <- parseInt added
                user: process.env['EMAIL_USER'] || "",
                pass: process.env['EMAIL_PASS'] || "",
                from: process.env['EMAIL_FROM'] || "AuthX<noreply@authx.com>",
            },
            oauth: {
                google: {
                    clientId: process.env['GOOGLE_CLIENT_ID'] || '',
                    clientSecret: process.env['GOOGLE_CLIENT_SECRET'] || '',
                },
                github: {
                    clientId: process.env['GITHUB_CLIENT_ID'] || '',
                    clientSecret: process.env['GITHUB_CLIENT_SECRET'] || '',
                },
            },
            session: {
                secret: process.env['SESSION_SECRET'] || "session-secret-default",
            },
            rateLimit: {
                windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] || '900000', 10), // 15 minutes
                maxRequests: parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] || '100', 10), // 100 requests
            },
            security: {
                corsOrigin: process.env['CORS_ORIGIN'] || '*',
                cookieSecure: process.env['COOKIE_SECURE'] === 'true',
                cookieHttpOnly: process.env['COOKIE_HTTP_ONLY'] === 'true',
                cookieSameSite: process.env['COOKIE_SAME_SITE'] || 'Lax',
            }

        }
    }

    // Validate required configuration values

    private validateConfig(): void {
        const requiredFields = [
            'jwt.accessSecret',
            'jwt.refreshSecret',
            'email.user',
            'email.pass',
            'session.secret',
        ];
        const missingFields = requiredFields.filter(field => {
            const value = this.getNestedValue(this.config, field);
            return !value || (typeof value === 'string' && value.trim() === '');
        });

        if (missingFields.length > 0) {
            throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
        }
    }

    // Get the nested value by path
    private getNestedValue(obj: any, path: string): any {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }

    // Get the configuration Object

    public getConfig(): Config {
        return this.config;
    }


    // check if the configuration is in production mode
    public isProduction(): boolean {
        return this.config.nodeEnv === 'production';
    }

    // check if the configuration is in development mode

    public isDevelopment(): boolean {
        return this.config.nodeEnv === 'development';
    }

    // check if the configuration is in test mode
    public isTest(): boolean {
        return this.config.nodeEnv === 'test';
    }


    // get database URI based on environment

    public getDatabaseUri(): string {
        if (this.isProduction()) {
            return process.env['MONGO_URI'] || this.config.mongoUri;
        }

        return this.config.mongoUri
    }


}


