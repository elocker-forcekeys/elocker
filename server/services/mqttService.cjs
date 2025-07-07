const mqtt = require('mqtt');

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
    this.reconnectInterval = 5000; // 5 seconds
    
    // Try to connect, but don't fail if MQTT broker is not available
    this.connect();
  }

  connect() {
    try {
      console.log('🔌 Attempting to connect to MQTT broker...');
      
      // Use a timeout to prevent hanging connections
      const options = {
        connectTimeout: 5000, // 5 seconds
        reconnectPeriod: 0, // Disable automatic reconnection
        clientId: `locker_system_${Math.random().toString(16).substr(2, 8)}`
      };

      this.client = mqtt.connect('mqtt://127.0.0.1:1883', options);

      this.client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
        this.isConnected = true;
        this.connectionAttempts = 0;
        
        // Subscribe to locker topics
        this.client.subscribe('lockers/+/status', (err) => {
          if (err) {
            console.error('❌ Failed to subscribe to locker status topics:', err);
          } else {
            console.log('📡 Subscribed to locker status topics');
          }
        });
      });

      this.client.on('error', (error) => {
        console.warn('⚠️ MQTT Client error:', error.message);
        this.isConnected = false;
        this.handleConnectionFailure();
      });

      this.client.on('close', () => {
        console.log('🔌 MQTT connection closed');
        this.isConnected = false;
      });

      this.client.on('message', (topic, message) => {
        this.handleMessage(topic, message.toString());
      });

    } catch (error) {
      console.warn('⚠️ Failed to initialize MQTT client:', error.message);
      this.handleConnectionFailure();
    }
  }

  handleConnectionFailure() {
    this.connectionAttempts++;
    
    if (this.connectionAttempts <= this.maxConnectionAttempts) {
      console.log(`🔄 Retrying MQTT connection (${this.connectionAttempts}/${this.maxConnectionAttempts}) in ${this.reconnectInterval/1000}s...`);
      setTimeout(() => {
        this.connect();
      }, this.reconnectInterval);
    } else {
      console.log('⚠️ MQTT broker not available - running in offline mode');
      console.log('💡 To enable MQTT features, ensure an MQTT broker is running on localhost:1883');
      this.isConnected = false;
    }
  }

  handleMessage(topic, message) {
    try {
      const data = JSON.parse(message);
      console.log(`📨 Received MQTT message on ${topic}:`, data);
      
      // Handle locker status updates
      if (topic.startsWith('lockers/') && topic.endsWith('/status')) {
        const lockerId = topic.split('/')[1];
        this.handleLockerStatusUpdate(lockerId, data);
      }
    } catch (error) {
      console.error('❌ Error parsing MQTT message:', error);
    }
  }

  handleLockerStatusUpdate(lockerId, data) {
    // In a real implementation, this would update the database
    console.log(`🔒 Locker ${lockerId} status update:`, data);
  }

  publish(topic, message) {
    if (!this.isConnected || !this.client) {
      console.warn(`⚠️ MQTT not connected - cannot publish to ${topic}`);
      return false;
    }

    try {
      this.client.publish(topic, JSON.stringify(message), (error) => {
        if (error) {
          console.error(`❌ Failed to publish to ${topic}:`, error);
        } else {
          console.log(`📤 Published to ${topic}:`, message);
        }
      });
      return true;
    } catch (error) {
      console.error(`❌ Error publishing to ${topic}:`, error);
      return false;
    }
  }

  // Simulate locker operations when MQTT is not available
  simulateLockerOperation(lockerId, operation) {
    console.log(`🎭 Simulating ${operation} for locker ${lockerId} (MQTT offline)`);
    
    // Return a simulated response
    return {
      success: true,
      lockerId,
      operation,
      timestamp: new Date().toISOString(),
      simulated: true
    };
  }

  openLocker(lockerId, compartmentId) {
    const topic = `lockers/${lockerId}/commands`;
    const command = {
      action: 'open',
      compartment: compartmentId,
      timestamp: new Date().toISOString()
    };

    if (this.publish(topic, command)) {
      return { success: true, message: 'Open command sent' };
    } else {
      return this.simulateLockerOperation(lockerId, 'open');
    }
  }

  closeLocker(lockerId, compartmentId) {
    const topic = `lockers/${lockerId}/commands`;
    const command = {
      action: 'close',
      compartment: compartmentId,
      timestamp: new Date().toISOString()
    };

    if (this.publish(topic, command)) {
      return { success: true, message: 'Close command sent' };
    } else {
      return this.simulateLockerOperation(lockerId, 'close');
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts
    };
  }

  disconnect() {
    if (this.client) {
      console.log('🔌 Disconnecting from MQTT broker...');
      this.client.end();
      this.isConnected = false;
    }
  }
}

module.exports = new MQTTService();