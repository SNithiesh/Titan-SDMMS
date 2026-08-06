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
// Allow localhost + any device on the same local network (Wi-Fi, hotspot, LAN)
function isLocalNetworkOrigin(origin) {
  if (!origin) return true; // No origin = mobile app / Postman, allow
  try {
    const { hostname } = new URL(origin);
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    // Allow any private network IP range
    if (/^192\.168\.\d+\.\d+$/.test(hostname)) return true; // Home/office Wi-Fi
    if (/^10\.\d+\.\d+\.\d+$/.test(hostname)) return true;  // Corporate / hotspot
    if (/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/.test(hostname)) return true; // Class B private
    return false;
  } catch {
    return false;
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (isLocalNetworkOrigin(origin)) return callback(null, true);
    // Also allow explicit production URL from .env
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) return callback(null, true);
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
