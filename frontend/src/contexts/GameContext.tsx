import { createContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type User = {
  id: number;
  nickname: string;
};

type Ball = {
  x: number;
  y: number;
};

type Game = {
  id: string;
  users: User[];
  ball: Ball;
};

type GameContextType = {
  game: Game;
  setGame: React.Dispatch<React.SetStateAction<Game>>;
};

export const GameContext = createContext({} as GameContextType);

export const GameContextProvider = ({ children }) => {
  const [game, setGame] = useState(null);

  const { gameId } = useParams(); // From the URL /chats/:gameId

  useEffect(() => {
    if (!gameId) {
      return;
    }
    const fetchGame = async () => {
      // Fetch the game from the backend using the gameId ( fake game for demonstration )
      // Using a fake game for now
      const game = {
        id: gameId,
        users: [
          { id: 1, nickname: "Fake user 1" },
          { id: 2, nickname: "Fake user 2" },
        ],
        ball: { x: 100, y: 100 },
      };
      setGame(game);
    };
    fetchGame();
  }, [gameId]); // This useEffect will run every time the gameId changes

  return (
    <GameContext.Provider value={{ game, setGame }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
