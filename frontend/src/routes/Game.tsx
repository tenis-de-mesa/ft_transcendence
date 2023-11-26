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
        const { paddle } = player;
        rc.rectangle(paddle.x, paddle.y, paddle.width, paddle.height, {
          stroke: "white",
          fill: "white",
        });
        if (index === 0) {
          ctx.fillText(player.score, (canvas.width * 1) / 4 - 10, 50);
        } else if (index === 1) {
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
    if (!socket) return;

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

    socket.emit(`joinGame`, id, (game) => {
      setPlayers([game.playerOne, game.playerTwo]);
    });

    socket.on("updatePlayerPosition", (players) => {
      setPlayers(players);
    });

    socket.on("updateBallPosition", ({ x, y }) => {
      setBallPosition({ x, y });
    });

    socket.emit("playerInGame");

    return () => {
      socket.off("updatePlayerPosition");
      socket.off("updateBallPosition");
      window.removeEventListener("keydown", handleKeyDown);
      socket.emit("playerLeftGame");
    };
  }, [socket, id]);

  return (
    <>
      <Typography variant="h5">Games</Typography>
      <div className="flex justify-center mt-10">
        <Typography className="m-2" variant="sm">{players[0]?.user?.nickname ?? ''}</Typography>
        <canvas
          ref={canvasRef}
          width={700}
          height={600}
          className="dark:bg-gray-900"
        />
        <Typography className="m-2" variant="sm">{players[1]?.user?.nickname ?? ''}</Typography>
      </div>
    </>
  );
};

export default Game;
