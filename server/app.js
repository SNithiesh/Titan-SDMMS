import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// ── SECURITY HEADERS ──────────────────────────────────────────
// helmet sets secure HTTP headers (X-Frame-Options, Content-Security-Policy etc.)
app.use(helmet({
  contentSecurityPolicy: false, // Disabled to allow Supabase real-time on frontend
  crossOriginEmbedderPolicy: false
}));

// ── CORS ───────────────────────────────────────────────────────
// Allow requests from the Vite dev server and production frontend
const allowedOrigins = [
  'http://localhost:5173',   // Vite dev server
  'http://localhost:5000',   // Production preview
  'http://localhost:4173',   // Vite preview
  process.env.FRONTEND_URL  // Production URL (set in .env)
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true
}));

// ── REQUEST PARSING ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── LOGGING ────────────────────────────────────────────────────
// Log all HTTP requests: method, path, status, response time
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── RATE LIMITING ──────────────────────────────────────────────
app.use('/api/', apiLimiter);

// ── API ROUTES ─────────────────────────────────────────────────
app.use('/api', routes);

// ── 404 HANDLER ────────────────────────────────────────────
app.use('/{*wildcard}', (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 'NOT_FOUND',
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// ── GLOBAL ERROR HANDLER ───────────────────────────────────────
// Must be registered last — catches all errors from controllers
app.use(errorHandler);

export default app;
