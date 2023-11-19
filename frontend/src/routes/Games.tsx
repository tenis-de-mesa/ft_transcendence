import { Typography } from "../components/Typography";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import rough from "roughjs";
import { useGameWebSocket } from "../hooks/useGameWebSocket";

const Games = () => {
  const canvasRef = useRef(null);

  const socket = useGameWebSocket();

  const [totalPlayers, setTotalPlayers] = useState(null);
  const [ballPosition, setBallPosition] = useState(null);
  // const [playerId, setPlayerId] = useState<string | undefined>(undefined);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rc = rough.canvas(canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (totalPlayers) {
      Object.keys(totalPlayers).forEach((id, index) => {
        const player = totalPlayers[id];
        if (index === 0) {
          rc.rectangle(10, player.y, 10, 100, { stroke: "white", fill: "white" });
        } else if (index === 1) {
          rc.rectangle(canvas.width - 20, player.y, 10, 100, { stroke: "white", fill: "white" });
        }
      });
    }
  
    if (ballPosition) {
      rc.circle(ballPosition.x, ballPosition.y, 16, { stroke: "white", fill: "white" });
    }
  }, [totalPlayers, ballPosition]);

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'w':
        socket.emit("movePlayer", { up: true });
        break;
      case 's':
        socket.emit("movePlayer", { down: true });
        break;
      case 'ArrowUp':
        socket.emit("movePlayer", { up: true });
        break;
      case 'ArrowDown':
        socket.emit("movePlayer", { down: true });
        break;
    }
  };
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log('Conectado ao servidor');
      });

      socket.on('disconnect', () => {
        console.log('Desconectado do servidor');
      });

      socket.on("socketConnection", (totalPlayers) => {
        setTotalPlayers(totalPlayers)
      });

      socket.on("socketDisconnection", (totalPlayers) => {
        setTotalPlayers(totalPlayers)
      });

      // socket.on("playerConnection", (playerConnectionId) => {
      //   setPlayerId(playerConnectionId)
      // });

      // socket.on("playerDisconnection", (playerConnectionId) => {
      //   setPlayerId(playerConnectionId)
      // });

      socket.on("updatePlayerPosition", ({ playerId, position }) => {
        setTotalPlayers((prevPlayers) => ({
          ...prevPlayers,
          [playerId]: position,
        }));
      });

      socket.on('updateBallPosition', ({ x, y }) => {
        setBallPosition({ x, y });
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("socketConnection");
        socket.off("socketDisconnection");
        // socket.off("playerConnection");
        // socket.off("playerDisconnection");
        socket.off("updatePlayerPosition");
        socket.off("updateBallPosition");
      };
    }
  }, [socket]);

  return (
    <>
      <Typography variant="h5">
        Games
      </Typography>

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

export default Games;
