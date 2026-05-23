import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { Worker } from '../models/Worker';

interface SocketData {
  userId: string;
  role: string;
}

export function setupSocketEvents(io: Server) {
  // Middleware for authentication
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    try {
      const payload = jwt.verify(token, ENV.JWT_SECRET) as any;
      socket.data = {
        userId: payload.id,
        role: payload.role,
      } as SocketData;
      next();
    } catch (e) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.userId})`);
    
    // Join a room specific to the user for direct messages
    socket.join(`user:${socket.data.userId}`);
    
    // Join role-specific rooms
    if (socket.data.role === 'worker') {
      socket.join('workers');
    }

    socket.on('worker:online', async ({ workerId }) => {
      if (socket.data.role === 'worker' && socket.data.userId === workerId) {
        if (ENV.USE_DB) await Worker.findByIdAndUpdate(workerId, { isOnline: true });
        io.emit('worker:status-changed', { workerId, isOnline: true });
        console.log(`Worker ${workerId} went online`);
      }
    });

    socket.on('worker:offline', async ({ workerId }) => {
      if (socket.data.role === 'worker' && socket.data.userId === workerId) {
        if (ENV.USE_DB) await Worker.findByIdAndUpdate(workerId, { isOnline: false });
        io.emit('worker:status-changed', { workerId, isOnline: false });
        console.log(`Worker ${workerId} went offline`);
      }
    });

    // Chat events
    socket.on('chat:join', ({ bookingId }) => {
      socket.join(`booking:${bookingId}`);
      console.log(`User ${socket.data.userId} joined chat for booking ${bookingId}`);
    });

    socket.on('chat:message', async (data) => {
      const { bookingId, content, type = 'text' } = data;
      const message = {
        id: Math.random().toString(36).substr(2, 9),
        bookingId,
        senderId: socket.data.userId,
        content,
        type,
        createdAt: new Date(),
      };
      
      // Emit to the booking room
      io.to(`booking:${bookingId}`).emit('chat:message', message);
      console.log(`Message sent in booking ${bookingId} by ${socket.data.userId}`);
    });

    socket.on('chat:typing', ({ bookingId, isTyping }) => {
      socket.to(`booking:${bookingId}`).emit('chat:typing', {
        userId: socket.data.userId,
        isTyping,
      });
    });

    // Booking Lifecycle Events
    socket.on('booking:request', async (data) => {
      const { bookingId, categoryId, location, radiusKm = 5 } = data;
      
      // In a real app, find nearby workers using MongoDB geo-spatial queries
      // For now, we'll broadcast to all online workers in the same category
      socket.to('workers').emit('booking:new-request', {
        bookingId,
        categoryId,
        location,
        customerName: socket.data.displayName || 'Customer',
      });
      console.log(`New booking request: ${bookingId} for category ${categoryId}`);
    });

    socket.on('booking:accept', async (data) => {
      const { bookingId, workerId } = data;
      
      // Update DB if needed
      // Notify the customer
      io.to(`user:${data.customerId}`).emit('booking:accepted', {
        bookingId,
        workerId,
        status: 'accepted'
      });
      
      console.log(`Booking ${bookingId} accepted by worker ${workerId}`);
    });

    socket.on('booking:status-update', (data) => {
      const { bookingId, customerId, status } = data;
      io.to(`user:${customerId}`).emit('booking:status-changed', {
        bookingId,
        status
      });
      console.log(`Booking ${bookingId} status changed to ${status}`);
    });

    socket.on('worker:location-update', (data) => {
      const { bookingId, customerId, location } = data;
      io.to(`user:${customerId}`).emit('worker:location-changed', {
        bookingId,
        location
      });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // In a real app, you might want to mark worker offline after a timeout
    });
  });
}
