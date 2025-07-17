import mongoose from 'mongoose';
import { Config } from '../types';

/**
 * Database configuration and connection setup
 * Handles MongoDB connection with proper error handling and logging
 */
export class DatabaseConfig {
    private static instance: DatabaseConfig;
    private config: Config;

    private constructor(config: Config) {
        this.config = config;
    }

    public static getInstance(config: Config): DatabaseConfig {
        if (!DatabaseConfig.instance) {
            DatabaseConfig.instance = new DatabaseConfig(config);
        }
        return DatabaseConfig.instance;
    }

    /**
     * Connect to MongoDB database
     */
    public async connect(): Promise<void> {
        try {
            const mongoUri = this.config.nodeEnv === 'production'
                ? process.env['MONGODB_URI_PROD'] || this.config.mongoUri
                : this.config.mongoUri;

            await mongoose.connect(mongoUri, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                bufferCommands: false,
            });

            console.log('✅ MongoDB connected successfully');

            // Handle connection events
            mongoose.connection.on('error', (error) => {
                console.error('❌ MongoDB connection error:', error);
            });

            mongoose.connection.on('disconnected', () => {
                console.warn('⚠️ MongoDB disconnected');
            });

            mongoose.connection.on('reconnected', () => {
                console.log('🔄 MongoDB reconnected');
            });

            // Graceful shutdown
            process.on('SIGINT', async () => {
                await mongoose.connection.close();
                console.log('📴 MongoDB connection closed through app termination');
                process.exit(0);
            });

        } catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
            process.exit(1);
        }
    }

    /**
     * Disconnect from MongoDB database
     */
    public async disconnect(): Promise<void> {
        try {
            await mongoose.connection.close();
            console.log('📴 MongoDB disconnected successfully');
        } catch (error) {
            console.error('❌ Error disconnecting from MongoDB:', error);
        }
    }

    /**
     * Get database connection status
     */
    public getConnectionStatus(): string {
        return mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    }
}