import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import gatewayRoutes from './gateway/routes.js';
import { setupWebSocket } from './websocket/handler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:3000'],
        methods: ['GET', 'POST']
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Gateway routes
app.use('/gateway', gatewayRoutes);

// Setup WebSocket
setupWebSocket(io);

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║         🎓 Tuition Chatbot Backend Server                  ║
╠════════════════════════════════════════════════════════════╣
║  HTTP Server:  http://localhost:${PORT}                       ║
║  WebSocket:    ws://localhost:${PORT}                         ║
║  Gateway:      http://localhost:${PORT}/gateway               ║
║  Health:       http://localhost:${PORT}/health                ║
╚════════════════════════════════════════════════════════════╝
  `);
});
