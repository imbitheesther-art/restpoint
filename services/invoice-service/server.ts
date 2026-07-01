require('dotenv').config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import invoiceRoutes from './routes/invoiceRoutes';
import invoice from './routes/invoice';

// Type declarations for Node.js globals
declare const process: any;
declare const __dirname: string;

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Allow credentials for proxied requests
app.use(cors({
  origin: true, // Allow any origin (API gateway handles origin validation)
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token', 'x-tenant-slug'],
}));
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    service: 'invoice-service',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/v1/restpoint', invoiceRoutes);
app.use('/api/v1/restpoint', invoice);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`invoice-service is running on port ${PORT}`);
});
