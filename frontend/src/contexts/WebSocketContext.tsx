import { createContext } from "react";
import { Socket, io } from "socket.io-client";

const baseURL = "https://transcendence.ngrok.app";

export const WebSocketContext = createContext({} as Socket);

export const WebSocketContextProvider = ({ children }) => {
  const socket = io(baseURL, {
    withCredentials: true,
    transports: ["websocket", "polling", "flashsocket"],
  });

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
