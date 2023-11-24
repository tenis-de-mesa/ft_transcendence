import { useContext, useEffect, useState } from "react";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";
import { Button, Card } from "../components";

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const socket = useWebSocket();
  const [invites, setInvites] = useState([]);

  useEffect(() => {
    const getInvites = () => {
      socket.emit("findMyInvites", currentUser.id, (invitesList) => {
        setInvites(invitesList);
      });
    };

    socket.on("newGameInvite", getInvites);
    getInvites();
  }, [socket, currentUser.id]);

  const acceptGameInvite = function (invite) {
    socket.emit("acceptInvitePlayerToGame", invite.id);
  };

  return (
    <div className="flex flex-col justify-start h-full p-5">
      <Typography variant="h5">Welcome, {currentUser.nickname} !</Typography>
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
                        onClick={() => acceptGameInvite(invite)}
                      >
                        Aceitar
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
