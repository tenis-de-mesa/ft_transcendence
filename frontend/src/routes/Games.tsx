import { Typography } from "../components/Typography";
import { socket } from "../socket";
import { useEffect } from "react";
// import useWebSocket from "react-use-websocket";

const Games = () => {
  // const ws = useWebSocket("ws://localhost:3001/");

  const user = { id: null };
  const users = [];

  useEffect(() => {
    socket.on("connect", () => {
      user.id = socket.id;
      users[socket.id] = user;
      console.log(users);
    });

    socket.on("pong", (data) => {
      console.log("pong", data);
    });
  });

  return (
    <>
      <Typography variant="h5">Games</Typography>

      <div className="mt-10 w-96 h-96 bg-gray-100">
        <button onClick={() => socket.emit("ping")}>Button</button>
      </div>
    </>
  );
};

export default Games;
