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
const { DEFAULT_DEV_FRONTEND } = require('./config/defaults');
const defaultOrigins = [process.env.FRONTEND_BASE_URL, process.env.DEV_FRONTEND_URL || DEFAULT_DEV_FRONTEND].filter(Boolean);

const allowedOrigins = Array.from(new Set([
  ...envOrigins,
  adminApp,
  userApp,
  ...defaultOrigins
].filter(Boolean)));

app.use(
  cors({
    origin: function(origin, callback) {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: This origin is not allowed - ' + origin));
    },
    credentials: true,
  })
);

// Routes
app.use("/api/v1/internal", internalUserRoutes);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/user", userRouter);
app.use('/api/v1/super-admin', superAdminRoutes);
app.use('/api/v1/partners', partnerRoutes);
app.use('/api/v1/partnership-activities', partnershipActivityRoutes);
app.use('/api/v1/feedback', feedbackRoutes);
app.use('/api/v1/partnership-statistics', partnershipStatisticsRoutes);

export default app;
