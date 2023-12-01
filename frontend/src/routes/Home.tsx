import { useContext, useEffect, useState } from "react";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";
import { Button, Card } from "../components";
import { Game } from "../types";
import { Link } from "react-router-dom";

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const socket = useWebSocket();
  const [invites, setInvites] = useState([]);
  const [liveGames, setLiveGames] = useState<Game[]>([]);
  const [inGameQueue, setInGameQueue] = useState(false);
  const [inGameQueueVanilla, setInGameQueueVanilla] = useState(false);

  useEffect(() => {
    socket.on("updateInviteList", (invitesList) => {
      setInvites(invitesList);
    });
    socket.on("updateLiveGames", (liveGames) => {
      setLiveGames(liveGames);
    });
    socket.emit("findMyInvites");
    socket.emit("findLiveGames");
  }, [socket]);

  useEffect(() => {
    socket.emit("inFindGameQueue", (inQueue) => setInGameQueue(inQueue));
  }, [socket, inGameQueue]);

  useEffect(() => {
    socket.emit("inFindGameQueue", { vanilla: true }, (inQueue) =>
      setInGameQueueVanilla(inQueue)
    );
  }, [socket, inGameQueueVanilla]);

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="">
        <Typography variant="h5" className="p-5">
          Welcome, {currentUser.nickname} !
        </Typography>
        <Card>
          <Card.Title position="center">
            <Typography variant="h6">Quick Play Queue</Typography>
          </Card.Title>
          <Card.Body className="!px-10 pb-5">
            <div className="flex justify-around gap-5">
              {!inGameQueue ? (
                <Button
                  variant="info"
                  size="lg"
                  onClick={() => {
                    socket.emit("findGame");
                    setInGameQueue(true);
                  }}
                >
                  Join
                </Button>
              ) : (
                <Button
                  variant="error"
                  size="lg"
                  onClick={() => {
                    socket.emit("cancelFindGame");
                    setInGameQueue(false);
                  }}
                >
                  Exit queue
                </Button>
              )}
              {!inGameQueueVanilla ? (
                <Button
                  variant="info"
                  size="lg"
                  onClick={() => {
                    socket.emit("findGame", { vanilla: true });
                    setInGameQueueVanilla(true);
                  }}
                >
                  Join Vanilla 🥱
                </Button>
              ) : (
                <Button
                  variant="error"
                  size="lg"
                  onClick={() => {
                    socket.emit("cancelFindGame", { vanilla: true });
                    setInGameQueueVanilla(false);
                  }}
                >
                  Exit vanilla queue
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>

        {invites.length > 0 && (
          <Card className="my-5">
            <Card.Title position="center">
              <Typography variant="h6">Game Invites</Typography>
            </Card.Title>
            <Card.Body className="!px-10" position="left">
              {invites.map((invite) => {
                return (
                  <div key={invite.id}>
                    <div className="flex items-center gap-2">
                      <Typography variant="md">{invite.nickname}</Typography>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() =>
                          socket.emit("acceptInvitePlayerToGame", invite.id)
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        variant="error"
                        size="sm"
                        onClick={() =>
                          socket.emit("declineInvitePlayerToGame", invite.id)
                        }
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        )}

        {liveGames.length > 0 && (
          <Card className="my-5">
            <Card.Title position="center">
              <Typography variant="h6">Live Games</Typography>
            </Card.Title>
            <Card.Body className="!px-10" position="left">
              {liveGames.map((game) => {
                return (
                  <div key={game.id}>
                    <div className="flex items-center gap-2">
                      <Typography variant="md">
                        {game.playerOne.nickname} x {game.playerTwo.nickname}
                      </Typography>
                      <Link to={`/games/${game.id}`}>
                        <Button variant="info" size="sm">
                          Join
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
}
