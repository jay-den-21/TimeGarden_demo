import { io, Socket } from 'socket.io-client';
import { getUser } from './authService';

const SOCKET_URL = 'http://localhost:4000';

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  /**
   * Connect to Socket.io server
   */
  connect(): Socket | null {
    if (this.socket?.connected) {
      return this.socket;
    }

    const user = getUser();
    if (!user || !user.id) {
      console.warn('Cannot connect to socket: User not logged in');
      return null;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      
      // Join with user ID
      if (user.id) {
        this.socket?.emit('join', user.id);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Join a thread room
   */
  joinThread(threadId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('join_thread', threadId);
    }
  }

  /**
   * Leave a thread room
   */
  leaveThread(threadId: number): void {
    if (this.socket?.connected) {
      this.socket.emit('leave_thread', threadId);
    }
  }

  /**
   * Send a message
   */
  sendMessage(threadId: number, text: string): void {
    const user = getUser();
    if (this.socket?.connected && user?.id) {
      this.socket.emit('send_message', {
        threadId,
        userId: user.id,
        text,
      });
    }
  }

  /**
   * Listen for new messages
   */
  onMessage(callback: (message: any) => void): void {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  /**
   * Remove message listener
   */
  offMessage(callback?: (message: any) => void): void {
    if (this.socket) {
      if (callback) {
        this.socket.off('new_message', callback);
      } else {
        this.socket.off('new_message');
      }
    }
  }

  /**
   * Listen for errors
   */
  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  /**
   * Get socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }
}

// Export singleton instance
export const socketService = new SocketService();

