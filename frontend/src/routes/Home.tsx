import { useContext, useEffect, useState } from "react";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";
import { Button, Card } from "../components";

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const socket = useWebSocket();
  const [invites, setInvites] = useState([]);
  const [inGameQueue, setInGameQueue] = useState(false);

  useEffect(() => {
    const getInvites = () => {
      socket.emit("findMyInvites", currentUser.id, (invitesList) => {
        setInvites(invitesList);
      });
    };

    socket.on("newGameInvite", getInvites);
    getInvites();
  }, [socket, currentUser.id]);

  useEffect(() => {
    socket.emit("inFindGameQueue", (inQueue) => setInGameQueue(inQueue));
  }, [socket, inGameQueue]);

  return (
    <div className="flex flex-col justify-start h-full p-5">
      <Typography variant="h5">Welcome, {currentUser.nickname} !</Typography>
      <div className="max-w-xl">
        <br />
        {!inGameQueue ? (
          <Button
            variant="info"
            onClick={() => {
              socket.emit("findGame");
              setInGameQueue(true);
            }}
          >
            Join Queue
          </Button>
        ) : (
          <Button
            variant="error"
            onClick={() => {
              socket.emit("cancelFindGame");
              setInGameQueue(false);
            }}
          >
            Exit Queue
          </Button>
        )}
      </div>
      {invites.length > 0 && (
        <Card className="max-w-xl">
          <Card.Title position="center">
            <Typography variant="h6">Game Invites</Typography>
          </Card.Title>
          <Card.Body className="!px-10" position="left">
            <ul>
              {invites.map((invite) => {
                return (
                  <li key={invite.id} className="text-white mb-2">
                    <div className="flex items-center gap-2">
                      {invite.nickname}
                      <Button
                        variant="info"
                        onClick={() =>
                          socket.emit("acceptInvitePlayerToGame", invite.id)
                        }
                      >
                        Accept
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
