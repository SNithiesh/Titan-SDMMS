import 'dotenv/config';
import app from './app.js';

const PORT = process.env.API_PORT || 3001;
const HOST = '0.0.0.0'; // Listen on all interfaces for Wi-Fi access

const server = app.listen(PORT, HOST, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        TITAN SDMMS — ENTERPRISE API SERVER           ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  ➜ API Server:   http://localhost:${PORT}/api          ║`);
  console.log(`║  ➜ Health Check: http://localhost:${PORT}/api/health   ║`);
  console.log(`║  ➜ Environment:  ${(process.env.NODE_ENV || 'development').padEnd(35)}║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');
});

// Graceful shutdown on Ctrl+C or server restart
process.on('SIGTERM', () => {
  console.log('[SERVER] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[SERVER] Closed. Goodbye.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
