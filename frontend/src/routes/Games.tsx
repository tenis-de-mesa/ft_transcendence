import { Typography } from "../components/Typography";
import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const URL = "http://localhost:3001/games";
const socket = io(URL, {
  withCredentials: true,
  autoConnect: true,
});

socket.on("connect", () => {
  // socket.auth.token = "abcd";

  // alert("connected");
  // console.log(t);
  console.log("connected");
  // const user = { id: socket.id };
  // users[socket.id] = user;
  // setUsers(users);
});

const animate = {
  render(canvasRef, users) {
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
    context.arc(canvas.width / 2, canvas.height / 2, 10, 0, 2 * Math.PI);
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

  const [move, setMove] = useState([]);

  useEffect(() => {
    animate.render(canvasRef, users);

    const handleKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("keydown", e.key);

      const moves = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };

      const move = moves[e.key];
      if (move) {
        socket.emit("ON_PLAYER_MOVE", { id: socket.id, move });
      }
    };

    const keystate = {};
    document.addEventListener("keydown", function (evt) {
      keystate[evt.key] = true;
    });
    document.addEventListener("keyup", function (evt) {
      delete keystate[evt.key];
    });

    setInterval(() => {
      console.log(keystate);
    }, 1000);

    socket.on("pong", () => {
      console.log(socket);
      console.log("pong");
    });

    socket.on("ON_PLAYERS_UPDATE", (players) => {
      // console.log("ON_PLAYERS_UPDATE", players);
      setUsers(players);
    });

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      socket.off("ON_PLAYERS_UPDATE");
      socket.off("connect");
      socket.off("pong");
    };
  });

  useEffect(() => {}, []);

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

      <div
        className="mt-10 flex justify-center"
        onKeyUp={(e) => console.log("onKeyUp")}
      >
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
