import { io } from "socket.io-client";

const baseURL = "https://transcendence.ngrok.app";

export const socket = io(baseURL, {
  withCredentials: true,
  transports: ["websocket", "polling", "flashsocket"],
});
