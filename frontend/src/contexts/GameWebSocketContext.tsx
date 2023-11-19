import { createContext } from "react";
import { Socket, io } from "socket.io-client";

const baseURL = "http://localhost:3001/games";

export const GameWebSocketContext = createContext({} as Socket);

export const GameWebSocketContextProvider = ({ children }) => {
  const socket = io(baseURL, {
    withCredentials: true,
    transports: ["websocket", "polling", "flashsocket"],
  });

  return (
    <GameWebSocketContext.Provider value={socket}>
      {children}
    </GameWebSocketContext.Provider>
  );
};

export default GameWebSocketContext;
