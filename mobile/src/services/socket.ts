import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '../constants';
import { useAuthStore } from '../store/authStore';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) return;

    const token = useAuthStore.getState().token;
    
    this.socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.log('Socket connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Emitters
  emitWorkerOnline(workerId: string) {
    this.socket?.emit('worker:online', { workerId });
  }

  emitWorkerOffline(workerId: string) {
    this.socket?.emit('worker:offline', { workerId });
  }

  emitBookingRequest(data: { bookingId: string; categoryId: string; location: any }) {
    this.socket?.emit('booking:request', data);
  }

  emitBookingAccept(data: { bookingId: string; workerId: string; customerId: string }) {
    this.socket?.emit('booking:accept', data);
  }

  emitBookingStatusUpdate(data: { bookingId: string; customerId: string; status: string }) {
    this.socket?.emit('booking:status-update', data);
  }

  emitWorkerLocationUpdate(data: { bookingId: string; customerId: string; location: { lat: number; lng: number } }) {
    this.socket?.emit('worker:location-update', data);
  }

  emitChatJoin(bookingId: string) {
    this.socket?.emit('chat:join', { bookingId });
  }

  emitChatMessage(data: { bookingId: string; content: string; type?: string }) {
    this.socket?.emit('chat:message', data);
  }

  emitChatTyping(bookingId: string, isTyping: boolean) {
    this.socket?.emit('chat:typing', { bookingId, isTyping });
  }
}

export const socketService = new SocketService();
