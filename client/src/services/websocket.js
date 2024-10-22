class WebSocketClient {
    constructor() {
      this.callbacks = new Map();
      this.connect();
    }
  
    connect() {
      const token = localStorage.getItem('token');
      this.ws = new WebSocket(`${process.env.REACT_APP_WS_URL}?token=${token}`);
  
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };
  
      this.ws.onclose = () => {
        setTimeout(() => this.connect(), 5000); // Reconnect after 5 seconds
      };
    }
  
    handleMessage(data) {
      const callbacks = this.callbacks.get(data.type) || [];
      callbacks.forEach(callback => callback(data));
    }
  
    subscribe(type, callback) {
      if (!this.callbacks.has(type)) {
        this.callbacks.set(type, []);
      }
      this.callbacks.get(type).push(callback);
    }
  
    unsubscribe(type, callback) {
      const callbacks = this.callbacks.get(type) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  
    send(data) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(data));
      }
    }
  }
  
  export default new WebSocketClient();