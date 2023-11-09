import { useContext } from "react";
import GameContext from "../contexts/GameContext";
import useGameWebSocket from "../hooks/useGameWebSocket";

const Game = () => {
  const { game } = useContext(GameContext);
  useGameWebSocket();

  return (
    <>
      <div className="mt-10 flex justify-center">
        Current game is game {game.id}
        Current ball is at {game.ball.x}, {game.ball.y}
        Current users are {game.users.map((user) => user.nickname).join(", ")}
      </div>
    </>
  );
};

export default Game;
