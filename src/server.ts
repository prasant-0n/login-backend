import { App } from './app';

/**
 * Server Entry Point
 * Initializes and starts the AuthX API server
 */

async function startServer(): Promise<void> {
    try {
        console.log('🚀 Starting AuthX API server...');

        const app = new App();
        await app.start();

        console.log('✅ AuthX API server started successfully');
    } catch (error) {
        console.error('❌ Failed to start AuthX API server:', error);
        process.exit(1);
    }
}

// Start the server
startServer(); 