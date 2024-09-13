require('dotenv').config(); // Load environment variables

import express, { Request, Response, NextFunction } from 'express'; // Import types
import cors from 'cors';
import cookieParser from 'cookie-parser';

export const app = express(); // Initialize Express app

// Body parser middleware
app.use(express.json({ limit: '50mb' }));

// Cookie parser middleware
app.use(cookieParser());

// CORS middleware
app.use(cors({
   origin: process.env.ORIGIN, // Corrected typo
}));

// Testing API endpoint
app.get('/test', (req: Request, res: Response, next: NextFunction) => {
   res.status(200).json({
      success: true,
      message: 'API is working', 
   });
});

// Unknown route handler
app.all('*', (req: Request, res: Response, next: NextFunction) => {
   const err = new Error(`Route ${req.originalUrl} not found`) as any; 
   err.statusCode = 404;
   next(err);
});
