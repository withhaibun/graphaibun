import { TUpData } from "./App";

export default class Socketed {
  socket?: WebSocket;
  reconnectInterval: number = 1000;
  maxReconnectInterval = 4000;
  constructor() {
    this.connectWebSocket();
  }
  update(upData: TUpData) { }
  connectWebSocket() {
    this.socket = new WebSocket("ws://localhost:9000");

    this.socket.onopen = () => {
      console.log("WebSocket Connected");
      this.maxReconnectInterval = 4000;
    };

    this.socket.onmessage = (event) => {
      const upData = JSON.parse(event.data);
      console.log("update", upData);
      this.update(upData);
    };

    this.socket.onclose = () => {
      console.log("WebSocket Disconnected");
      this.scheduleReconnect();
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      this.socket?.close(); // Ensure socket is closed before attempting to reconnect
    };
  }

  scheduleReconnect() {
    setTimeout(() => {
      if (this.socket?.readyState !== WebSocket.OPEN && this.socket?.readyState !== WebSocket.CONNECTING) {
        console.log("Attempting to Reconnect...");
        this.connectWebSocket();
      }
    }, this.reconnectInterval);

    // Increase the reconnect interval with exponential backoff
    this.reconnectInterval = Math.min(this.reconnectInterval * 2, this.maxReconnectInterval);
  }
}
