import { useContext, useEffect } from "react";
import { WebSocketContext } from "../contexts/WebSocketContext";
import GameContext from "../contexts/GameContext";

const useGameWebSocket = () => {
  const { socket } = useContext(WebSocketContext);
  const { game, setGame } = useContext(GameContext);

  useEffect(() => {
    if (!socket || !game) return;

    // Join the game room
    socket.emit("join_game", game.id);

    // Subscribe to the changes
    socket.on("ON_BALL_UPDATE", (ball) => {
      setGame((prevGame) => ({
        ...prevGame,
        ball,
      }));
    });

    // ... Other events

    // Leave the game room and unsubscribe from the changes
    return () => {
      socket.emit("leave_game", game.id);
      socket.off("ON_BALL_UPDATE");
    };
  }, [socket, game, setGame]);
};

export default useGameWebSocket;
