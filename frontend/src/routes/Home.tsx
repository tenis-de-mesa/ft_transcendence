import { useContext, useEffect, useState } from "react";
import { Typography } from "../components/Typography";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";
import { Button, Card } from "../components";
import { Link } from "react-router-dom";

export default function Home() {
  const { currentUser } = useContext(AuthContext);
  const socket = useWebSocket();
  const [invites, setInvites] = useState([]);
  const [liveGames, setLiveGames] = useState([]);
  const [inGameQueue, setInGameQueue] = useState(false);
  const [inGameQueueVanilla, setInGameQueueVanilla] = useState(false);

  useEffect(() => {
    socket.on("updateInviteList", (invitesList) => {
      setInvites(invitesList);
    });
    socket.on("currentLiveGames", (liveGames) => {
      setLiveGames(liveGames);
    });
    socket.emit("findMyInvites");
  }, [socket]);

  useEffect(() => {
    socket.emit("inFindGameQueue", (inQueue) => setInGameQueue(inQueue));
  }, [socket, inGameQueue]);

  useEffect(() => {
    socket.emit("inFindGameQueue", { vanilla: true }, (inQueue) =>
      setInGameQueueVanilla(inQueue),
    );
  }, [socket, inGameQueueVanilla]);

  return (
    <div className="center">
      <div>
        <Typography variant="h4" className="p-5">
          Welcome, {currentUser.nickname}!
        </Typography>
        <Card>
          <Card.Title position="center">
            <Typography variant="h6">Quick Game</Typography>
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
          <Card className="my-5 max-h-96 overflow-scroll no-scrollbar">
            <Card.Title position="center">
              <Typography variant="h6">Game Invites</Typography>
            </Card.Title>
            <Card.Body className="!px-10 pb-10" position="left">
              {invites.map((invite) => {
                return (
                  <div key={invite.id}>
                    <div className="flex items-center gap-2 space-y-2">
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
              {liveGames.map((liveGame) => {
                return (
                  <div key={liveGame.gameId}>
                    <div className="flex items-center gap-2">
                      <Typography variant="md">
                        {liveGame.playerOneNickname} x{" "}
                        {liveGame.playerTwoNickname}
                      </Typography>
                      <Link to={`/games/${liveGame.gameId}`}>
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
