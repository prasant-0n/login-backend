import { AppConfig } from "./config/app";
import { requestLogger, securityHeaders } from "./middlewares/errorHandler";
import { DatabaseConfig } from "./config/database";
import authRoutes from './routes/auth.routes';
import helmet from "helmet";
import cors from "cors";
import express, { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import morgan from "morgan";

/**
 * Express Application Setup
 * Configures all middleware, routes, and error handling
 */
export class App {
    public app!: express.Application;
    private config = AppConfig.getInstance();

    constructor() {

        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();


        // this.initializeOAuth();
        // this.initializeErrorHandling();

    }
    /**
     * Initialize all middleware
     */
    private initializeMiddlewares(): void {
        // Add your middleware setup here
        const config = this.config.getConfig();

        this.app.use(helmet());
        this.app.use(securityHeaders);

        // cors config
        // Allow cross-origin requests from the specified origin
        this.app.use(cors({
            origin: config.security.corsOrigin, // Allow requests from the specified origin
            credentials: true, // Allow cookies to be sent with requests
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        }));

        const limiter = rateLimit({
            windowMs: config.rateLimit.windowMs, // 15 minutes
            max: this.config.getConfig().rateLimit.maxRequests, // Limit each IP to 100 requests per windowMs
            standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
            legacyHeaders: false, // Disable the `X-RateLimit-*` headers
            message: {
                success: false,
                message: 'Too many requests, please try again later.',
                error: ' Rate limit exceeded'
            }
        })

        this.app.use('/api/', limiter); // Apply rate limiting to all API routes

        // body parsing middleware
        this.app.use(express.json({ limit: '10mb' })); // Parse JSON request bodies
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded request bodies
        this.app.use(express.text({ limit: '10mb' })); // Parse text request bodies


        //cookie parser middleware

        this.app.use(cookieParser());

        // Session configuration
        this.app.use(session({
            secret: config.session.secret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: config.security.cookieSecure,
                httpOnly: config.security.cookieHttpOnly,
                sameSite: config.security.cookieSameSite as any,
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            }
        }));

        // Initialize Passport.js for authentication

        this.app.use(passport.initialize()); // Initialize Passport.js for authentication
        this.app.use(passport.session()); // Use session for Passport.js

        // logging middleware

        if (this.config.isDevelopment()) {
            this.app.use(morgan('dev')); // Use morgan for logging in development mode
        } else {
            this.app.use(morgan('combined')); // Use combined logging format in production
        }

        // Request logger

        this.app.use(requestLogger)






    }


    /**
     * Initialize all routes
     */
    private initializeRoutes(): void {

        // Health check endpoint

        this.app.get('/health', (_req: Request, res: Response) => {
            res.json({
                success: true,
                message: 'AuthX API is running smoothly!',
                timestamp: new Date().toISOString(),
                environment: this.config.getConfig().nodeEnv
            });
        });


        // Root endpoint

        this.app.get('/', (_req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: 'Welcome to AuthX API',
                version: '1.0.0',
                documentation: '/api/docs',
                endpoints: {
                    auth: '/api/auth',
                    user: '/api/user',
                    admin: '/api/admin'
                }
            });
        });


        // API routes
        this.app.use('/api/auth', authRoutes);



    }

    /**
     * Initialize database connection
     */
    public async initializeDatabase(): Promise<void> {
        const dbConfig = DatabaseConfig.getInstance(this.config.getConfig());
        await dbConfig.connect();
    }

    /**
    * Start the server
    */
    public async start(): Promise<void> {
        try {
            // Initialize database
            await this.initializeDatabase();

            const port = this.config.getConfig().port;
            this.app.listen(port, () => {
                console.log(`🚀 AuthX API server running on port ${port}`);
                console.log(`📊 Environment: ${this.config.getConfig().nodeEnv}`);
                console.log(`🔗 Base URL: ${this.config.getConfig().baseUrl}`);
                console.log(`📝 API Documentation: ${this.config.getConfig().baseUrl}/api/docs`);
            });
        } catch (error) {
            console.error('❌ Failed to start server:', error);
            process.exit(1);
        }
    }



}

