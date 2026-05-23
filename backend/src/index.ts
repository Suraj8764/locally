import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Server } from 'socket.io';
import http from 'http';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { initFirebase } from './config/firebase';
import { setupSocketEvents } from './socket/events';

import authRoutes from './routes/auth';
import workerRoutes from './routes/workers';
import bookingRoutes from './routes/bookings';
import categoryRoutes from './routes/categories';
import leadRoutes from './routes/leads';

async function bootstrap() {
  await connectDB();
  initFirebase();

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  // Make io accessible in routes
  app.set('io', io);

  setupSocketEvents(io);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'SebaLink Backend is running' });
  });

  app.use('/v1/auth', authRoutes);
  app.use('/v1/workers', workerRoutes);
  app.use('/v1/bookings', bookingRoutes);
  app.use('/v1/categories', categoryRoutes);
  app.use('/v1/leads', leadRoutes);

  server.listen(ENV.PORT, () => {
    console.log(`Server is running on port ${ENV.PORT}`);
  });
}

bootstrap().catch(console.error);
