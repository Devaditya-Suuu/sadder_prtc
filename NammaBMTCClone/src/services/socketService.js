import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.serverUrl = 'http://10.77.179.139:3001';
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    this.socket = io(this.serverUrl, {
      transports: ['websocket'],
      timeout: 10000,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Disconnected from WebSocket server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
      this.isConnected = false;
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  // Bus tracking methods
  trackBus(busId, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      this.connect();
    }

    if (this.socket) {
      console.log(`🚌 Tracking bus: ${busId}`);
      this.socket.emit('track-bus', busId);
      
      this.socket.on('bus-location-update', (data) => {
        if (data.busId === busId) {
          callback(data);
        }
      });
    }
  }

  stopTrackingBus(busId) {
    if (this.socket && this.isConnected) {
      console.log(`🛑 Stopped tracking bus: ${busId}`);
      this.socket.emit('stop-tracking', busId);
      this.socket.off('bus-location-update');
    }
  }

  // Route tracking methods
  trackRoute(routeId, callback) {
    if (!this.socket || !this.isConnected) {
      console.warn('⚠️ Socket not connected, attempting to connect...');
      this.connect();
    }

    if (this.socket) {
      console.log(`🛣️ Tracking route: ${routeId}`);
      this.socket.emit('track-route', routeId);
      
      this.socket.on('route-update', (data) => {
        if (data.routeId === routeId) {
          callback(data);
        }
      });
    }
  }

  stopTrackingRoute(routeId) {
    if (this.socket && this.isConnected) {
      console.log(`🛑 Stopped tracking route: ${routeId}`);
      this.socket.emit('stop-tracking', routeId);
      this.socket.off('route-update');
    }
  }

  // General event listeners
  onBusLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('bus-location-update', callback);
    }
  }

  onRouteUpdate(callback) {
    if (this.socket) {
      this.socket.on('route-update', callback);
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getSocket() {
    return this.socket;
  }
}

export default new SocketService();
