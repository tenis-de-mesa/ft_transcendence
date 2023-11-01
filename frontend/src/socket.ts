import { io } from "socket.io-client";
const URL = "http://localhost:3001";
export const socket = io(URL, { withCredentials: true });

socket.on("authSuccess", (userId: string) => {
  socket.auth = { userId };
  socket.disconnect().connect();
});
