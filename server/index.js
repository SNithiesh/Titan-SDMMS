import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || process.env.API_PORT || 3001;
const HOST = '0.0.0.0'; // Listen on all interfaces for Wi-Fi access

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for local Wi-Fi access
    methods: ['GET', 'POST', 'PATCH']
  }
});

app.set('io', io); // Attach to express for controllers to use

io.on('connection', (socket) => {
  console.log(`[SOCKET] Device connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[SOCKET] Device disconnected: ${socket.id}`);
  });
});

server.listen(PORT, HOST, () => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        TITAN SDMMS — OFFLINE ENTERPRISE API          ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  ➜ API Server:   http://localhost:${PORT}/api          ║`);
  console.log(`║  ➜ WebSockets:   ws://localhost:${PORT}                ║`);
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
