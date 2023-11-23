import { Typography } from "../components/Typography";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useWebSocket } from "../hooks";
import { useParams } from "react-router-dom";

const Game = () => {
  const { id } = useParams<{ id: string }>();
  const canvasRef = useRef(null);
  const socket = useWebSocket();

  const [players, setPlayers] = useState([]);
  const [ballPosition, setBallPosition] = useState(null);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";

    if (players) {
      players.forEach((player, index) => {
        if (index === 0) {
          rc.rectangle(10, player.y, 10, 100, {
            stroke: "white",
            fill: "white",
          });
          ctx.fillText(player.score, (canvas.width * 1) / 4 - 10, 50);
        } else if (index === 1) {
          rc.rectangle(canvas.width - 20, player.y, 10, 100, {
            stroke: "white",
            fill: "white",
          });
          ctx.fillText(player.score, (canvas.width * 3) / 4 - 10, 50);
        }
      });
    }

    if (ballPosition) {
      rc.circle(ballPosition.x, ballPosition.y, 16, {
        stroke: "white",
        fill: "white",
      });
    }
  }, [players, ballPosition]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      switch (event.key) {
        case "w":
          socket.emit("movePlayer", { gameId: id, up: true });
          break;
        case "s":
          socket.emit("movePlayer", { gameId: id, down: true });
          break;
        case "ArrowUp":
          socket.emit("movePlayer", { gameId: id, up: true });
          break;
        case "ArrowDown":
          socket.emit("movePlayer", { gameId: id, down: true });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    if (socket) {
      socket.emit(`joinGame`, id, (game) => {
        setPlayers(game.players);
      });

      socket.emit("playerInGame");

      socket.on("updatePlayerPosition", (players) => {
        setPlayers(players);
      });

      socket.on("updateBallPosition", ({ x, y }) => {
        setBallPosition({ x, y });
      });

      return () => {
        socket.emit("playerLeftGame");
        socket.off("updatePlayerPosition");
        socket.off("updateBallPosition");
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [socket, id]);

  return (
    <>
      <Typography variant="h5">Games</Typography>

      <div className="flex justify-center mt-10">
        <canvas
          ref={canvasRef}
          width={700}
          height={600}
          className="dark:bg-gray-900"
        />
      </div>
    </>
  );
};

export default Game;
