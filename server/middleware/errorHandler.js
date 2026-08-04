/**
 * Global Error Handler Middleware
 * Must be registered LAST in Express middleware chain
 * Catches all unhandled errors from controllers/services
 * Never exposes stack traces to users in production
 */
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log full error details to server console
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  if (isDev) console.error(err.stack);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    status: 'error',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    message: isDev ? err.message : 'An unexpected error occurred. Please try again.',
    ...(isDev && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
}
