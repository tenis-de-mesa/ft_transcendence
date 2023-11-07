import { Typography } from "../components/Typography";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import useMovement from "../hooks/useMovement";

const URL = "http://localhost:3001/games";
const socket = io(URL, {
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  console.log("connected");
});

const animate = {
  render(canvasRef, users, ball) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // background
    context.fillStyle = "black";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // players
    context.fillStyle = "white";

    Object.keys(users).forEach((id, index) => {
      const user = users[id];
      if (index === 0) {
        context.fillRect(10, 20 + user.y, 20, 100);
      } else if (index === 1) {
        context.fillRect(canvas.width - 30 + user.x, 20 + user.y, 20, 100);
      }
    });

    // context.fillRect(10, 20, 20, 100);
    // context.fillRect(canvas.width - 30, 20, 20, 100);

    // ball
    context.beginPath();
    context.arc(ball.x, ball.y, 10, 0, 2 * Math.PI);
    context.fill();

    // tracejado
    context.fillStyle = "white";
    let i = 10;
    while (i < canvas.height) {
      context.fillRect(canvas.width / 2 - 2.5, i, 5, 15);
      i += 30;
    }
  },
};

const Games = () => {
  const canvasRef = useRef(null);

  const [users, setUsers] = useState({});
  const [ball, setBall] = useState({ x: 0, y: 0 });

  useMovement({ timeInterval: 1, defaultMovement: 10 }, (move) => {
    socket.emit("ON_PLAYER_MOVE", { id: socket.id, move });
  });

  useEffect(() => {
    socket.on("pong", () => {
      console.log("pong", socket);
    });

    socket.on("ON_PLAYERS_UPDATE", (players) => {
      setUsers(players);
    });

    socket.on("ON_BALL_UPDATE", (ball) => {
      setBall(ball);
    });

    return () => {
      socket.off("ON_PLAYERS_UPDATE");
      socket.off("ON_BALL_UPDATE");
      socket.off("pong");
    };
  }, []);

  useEffect(() => {
    animate.render(canvasRef, users, ball);
  }, [users, ball]);

  return (
    <>
      <Typography variant="h5">
        <button
          className="mt-3 text-success-25"
          onClick={() => socket.emit("ping")}
        >
          Games
        </button>
      </Typography>

      <div className="mt-10 flex justify-center">
        <canvas
          ref={canvasRef}
          style={{ backgroundColor: "black" }}
          width={700}
          height={600}
        />
      </div>
    </>
  );
};

export default Games;
