import { createContext, useState, useEffect, useContext } from "react";
import io, { Socket } from "socket.io-client";
import AuthContext from "./AuthContext";

type WebSocketContextType = {
  socket: Socket;
};

export const WebSocketContext = createContext({} as WebSocketContextType);

export const WebSocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  // Whenever the user changes, we need to reconnect the WebSocket
  useEffect(() => {
    if (!currentUser) {
      return;
    }
    const newSocket = io("http://localhost:3001", {
      auth: { user: currentUser },
      withCredentials: true,
    });
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser]);

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketContext;
