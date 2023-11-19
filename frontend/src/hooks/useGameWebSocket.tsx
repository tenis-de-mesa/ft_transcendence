import { useContext } from "react";
import { GameWebSocketContext } from "../contexts/GameWebSocketContext";

export const useGameWebSocket = () => {
  return useContext(GameWebSocketContext);
};
