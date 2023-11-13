import { useContext } from "react";
import { WebSocketContext } from "../contexts";

export const useWebSocket = () => {
  return useContext(WebSocketContext);
};
