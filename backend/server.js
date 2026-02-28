import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import http from 'http';
import WebSocket from 'ws';

import { testConnection } from './config/db.js';
import authRoutes from './routes/sql/auth.routes.js';
import productsRoutes from './routes/sql/products.routes.js';
import ordersRoutes from './routes/sql/orders.routes.js';
import adminRoutes from './routes/sql/admin.routes.js';
import aiRoutes from './routes/sql/ai.routes.js';
import realtimeRoutes from './routes/sql/realtime.routes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { initializeRealtime, subscribeToTable, broadcastChange, isRealtimeConnected } from './services/realtimeService.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);

const corsOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS origin not allowed'));
    },
    credentials: true
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 200),
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

app.get('/health', async (req, res) => {
  try {
    await testConnection();
    const realtimeStatus = isRealtimeConnected() ? 'connected' : 'disconnected';
    res.json({ 
      success: true, 
      service: 'Tech Turf API', 
      db: 'ok',
      realtime: realtimeStatus
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      service: 'Tech Turf API', 
      db: 'error', 
      message: error.message 
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/realtime', realtimeRoutes);

app.use(notFound);
app.use(errorHandler);

async function bootstrap() {
  try {
    // Test database connection
    await testConnection();
    console.log('✓ Database connection successful');

    // Create HTTP server
    const server = http.createServer(app);

    // Initialize WebSocket server for real-time updates
    const wss = new WebSocket.Server({ server, path: '/ws' });
    const wsClients = new Set();

    // Initialize Supabase Real-time
    const realtimeInitialized = initializeRealtime();

    wss.on('connection', (ws) => {
      console.log('✓ New WebSocket client connected');
      wsClients.add(ws);

      // Send connection confirmation
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'Real-time connection established',
        timestamp: new Date().toISOString()
      }));

      // Handle incoming messages
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          
          if (message.type === 'subscribe' && message.table && realtimeInitialized) {
            // Subscribe to table changes
            subscribeToTable(message.table, (payload) => {
              broadcastChange(wsClients, message.table, payload);
            });
            
            ws.send(JSON.stringify({
              type: 'subscribed',
              table: message.table,
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        wsClients.delete(ws);
        console.log('✓ WebSocket client disconnected');
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
      });
    });

    // Start server
    server.listen(PORT, () => {
      console.log(`\n🚀 Tech Turf API running on port ${PORT}`);
      console.log(`📡 WebSocket real-time available at ws://localhost:${PORT}/ws`);
      console.log(`🔗 Real-time status: ${realtimeInitialized ? 'ENABLED ✓' : 'DISABLED ⚠'}\n`);
    });

    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
