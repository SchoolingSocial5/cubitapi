import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
// Load env vars
dotenv.config();

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! Γ£û Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1);
});

import cors from 'cors';
import connectDB from './src/config/db';
import errorHandler from './src/middleware/error';
import userRoutes from './src/routes/userRoutes';
import placeRoutes from './src/routes/placeRoutes';
import templateRoutes from './src/routes/templateRoutes';
import listingRoutes from './src/routes/listingRoutes';
import auctionRoutes from './src/routes/auctionRoutes';
import policyRoutes from './src/routes/policyRoutes';
import blogRoutes from './src/routes/blogRoutes';
import bookmarkRoutes from './src/routes/bookmarkRoutes';
import materialRoutes from './src/routes/materialRoutes';
import uploadRoutes from './src/routes/uploadRoutes';
import cartRoutes from './src/routes/cartRoutes';

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use((req, res, next) => {
    if (req.method === 'PUT' || req.method === 'POST') {
        const size = req.headers['content-length'];
        console.log(`${req.method} ${req.url} - Payload Size: ${size ? (parseInt(size) / (1024 * 1024)).toFixed(2) : 'unknown'} MB`);
    }
    next();
});
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/places', placeRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/listings', listingRoutes);
app.use('/api/v1/auctions', auctionRoutes);
app.use('/api/v1/policies', policyRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/bookmarks', bookmarkRoutes);
app.use('/api/v1/materials', materialRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/cart', cartRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('API is running in TypeScript...');
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
    console.error('UNHANDLED REJECTION! Γ£û Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    server.close(() => {
        process.exit(1);
    });
});
