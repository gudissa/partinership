// app.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import superAdminRoutes from './routes/superAdminRoutes.js';
import internalUserRoutes from './routes/internalUserRoutes.js';
import partnerRoutes from './routes/partnerRoutes.js';
import partnershipActivityRoutes from './routes/partnershipActivityRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import partnershipStatisticsRoutes from './routes/partnershipStatisticsRoutes.js';
import DEFAULTS from './config/defaults.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add this before your routes
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/api/v1/files', express.static(path.join(__dirname, 'public/uploads')));
// Build allowed origins from environment variables (comma-separated) and sensible defaults
const envOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
const adminApp = process.env.ADMIN_APP_URL || process.env.FRONTEND_BASE_URL;
const userApp = process.env.USER_APP_URL || process.env.FRONTEND_BASE_URL;

// Default to any explicitly set frontend base URL or fall back to localhost:3000 for dev tools
const { DEFAULT_DEV_FRONTEND, DEFAULT_ADMIN_FRONTEND, DEFAULT_USER_FRONTEND } = DEFAULTS;
const defaultOrigins = [
  process.env.FRONTEND_BASE_URL, 
  process.env.DEV_FRONTEND_URL || DEFAULT_DEV_FRONTEND,
  // Add default frontend ports for development
  DEFAULT_ADMIN_FRONTEND,
  DEFAULT_USER_FRONTEND,
  'http://localhost:5173', // Vite default admin port
  'http://localhost:5174', // Vite default user port
  'http://localhost:3000', // Common React dev port
].filter(Boolean);

// Build a de-duplicated list of allowed origins (as provided via envs).
const allowedOrigins = Array.from(new Set([
  ...envOrigins,
  adminApp,
  userApp,
  ...defaultOrigins
].filter(Boolean)));

// Log allowed origins in development
if (process.env.NODE_ENV !== 'production') {
  console.log('🌐 CORS allowed origins:', allowedOrigins.length > 0 ? allowedOrigins : 'All origins (development mode)');
}

// Normalize origins for reliable matching: strip trailing slash and lowercase.
const normalizeOrigin = (u) => (typeof u === 'string' ? u.replace(/\/$/, '').toLowerCase() : u);
const allowedOriginsNormalized = allowedOrigins.map(normalizeOrigin);

app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      // Normalize incoming origin and compare against normalized allow-list.
      const incoming = normalizeOrigin(origin);

      // Allow wildcard entry if present in CORS_ORIGINS (e.g., CORS_ORIGINS="*")
      if (allowedOriginsNormalized.indexOf('*') !== -1) {
        return callback(null, true);
      }

      if (allowedOriginsNormalized.indexOf(incoming) !== -1) {
        return callback(null, true);
      }

      return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
    },
    credentials: true,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API info endpoint
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Partnership Management System API',
    version: '1.0.0',
    endpoints: {
      internal: '/api/v1/internal',
      admin: '/api/v1/admin',
      user: '/api/v1/user',
      superAdmin: '/api/v1/super-admin',
      partners: '/api/v1/partners',
      partnershipActivities: '/api/v1/partnership-activities',
      feedback: '/api/v1/feedback',
      partnershipStatistics: '/api/v1/partnership-statistics'
    }
  });
});

// Routes
app.use("/api/v1/internal", internalUserRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/partnership-activities', partnershipActivityRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/partnership-statistics', partnershipStatisticsRoutes);

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

export default app;
