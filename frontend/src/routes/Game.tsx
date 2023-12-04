import { Typography } from "../components/Typography";
import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import rough from "roughjs";
import { useWebSocket } from "../hooks";
import { Link, useLoaderData } from "react-router-dom";
import { Game } from "../types";
import { Alert, Avatar, Button, Card, Overlay } from "../components";
import { AuthContext } from "../contexts";

const Game = () => {
  const { currentUser } = useContext(AuthContext);
  const socket = useWebSocket();
  const loaderGame = useLoaderData() as Game;

  const canvasRef = useRef(null);
  const [game, setGame] = useState(loaderGame);
  const [players, setPlayers] = useState([]);
  const [ballPosition, setBallPosition] = useState(null);
  const [powerUp, setPowerUp] = useState(null);
  const [gameOver, setGameOver] = useState(game.status === "finish");
  const [gamePaused, setGamePaused] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const isPlayer =
    game.playerOne.id == currentUser.id || game.playerTwo.id == currentUser.id;

  useEffect(() => {
    setGamePaused(false);
  }, [ballPosition, players]);

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
      rc.circle(ballPosition.x, ballPosition.y, ballPosition.radius, {
        stroke: "white",
        fill: "white",
      });
    }

    if (powerUp) {
      if (!powerUp.active) {
        rc.circle(powerUp.x, powerUp.y, 24, {
          stroke: "cyan",
          fill: "cyan",
        });
      }
    }
  }, [players, ballPosition, powerUp]);

  useEffect(() => {
    if (!socket) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case "w":
          socket.emit("movePlayer", { gameId: game.id, up: true });
          break;
        case "s":
          socket.emit("movePlayer", { gameId: game.id, down: true });
          break;
        case "ArrowUp":
          socket.emit("movePlayer", { gameId: game.id, up: true });
          break;
        case "ArrowDown":
          socket.emit("movePlayer", { gameId: game.id, down: true });
          break;
      }
    };

    // Only add event listener if the current user is a player in the game
    if (isPlayer) {
      window.addEventListener("keydown", handleKeyDown);
    }

    socket.emit(`joinGame`, game.id, (game) => {
      setPlayers([game.playerOne, game.playerTwo]);
    });

    socket.on("updatePlayerPosition", (players) => {
      setPlayers(players);
    });

    socket.on("updateBallPosition", ({ x, y, radius }) => {
      setBallPosition({ x, y, radius });
    });

    socket.on("updatePowerUp", ({ x, y, active }) => {
      setPowerUp({ x, y, active });
    });

    socket.on("gameOver", (game: Game) => {
      setGamePaused(false);
      setGameOver(true);
      setGame(game);
    });

    socket.on("gamePause", (remainingSeconds: number) => {
      setGameOver(false);
      setGamePaused(true);
      setRemainingSeconds(remainingSeconds);
    });

    socket.emit("playerInGame");

    return () => {
      socket.off("updatePlayerPosition");
      socket.off("updateBallPosition");
      socket.off("updatePowerUp");
      socket.off("pup");
      window.removeEventListener("keydown", handleKeyDown);
      socket.emit("playerLeftGame");
      socket.emit("leaveGame", game.id);
    };
  }, [socket, game, isPlayer]);

  return (
    <>
      <Typography variant="h5" className="text-center mb-3">
        Game {game.id}
      </Typography>
      <div className="grid items-center justify-center">
        {!isPlayer && (
          <Alert severity="info" className="mb-3">
            You are watching as a spectator
          </Alert>
        )}
        <div className="flex justify-around">
          <Typography className="m-2" variant="sm">
            {game.playerOne.nickname}
          </Typography>
          <Typography className="m-2" variant="sm">
            {game.playerTwo.nickname}
          </Typography>
        </div>
        <canvas
          ref={canvasRef}
          width={700}
          height={600}
          className="dark:bg-gray-900"
        />
      </div>

      {gameOver && !gamePaused && (
        <>
          <Overlay />
          <Card className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-[1001] min-w-[27rem]">
            <Card.Title>
              <Typography variant="h6" customWeight="bold">
                {game.winner
                  ? `${game.winner.nickname} won!`
                  : `Game abandoned`}
              </Typography>
            </Card.Title>
            <Card.Body className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div>
                  <Avatar
                    seed={game.playerOne.login}
                    src={game.playerOne.avatarUrl}
                    size="md"
                    className="inline"
                  />
                  <Typography variant="md">
                    {game.playerOne.nickname}
                  </Typography>
                  <div
                    className={
                      game.playerOneMatchPoints > 0
                        ? "text-success-200"
                        : "text-error-200"
                    }
                  >
                    {game.playerOneMatchPoints > 0 ? "+" : ""}
                    {game.playerOneMatchPoints}
                  </div>
                </div>
                <div>
                  <Typography variant="md" customWeight="bold">
                    {game.playerOneScore} - {game.playerTwoScore}
                  </Typography>
                </div>
                <div>
                  <Avatar
                    seed={game.playerTwo.login}
                    src={game.playerTwo.avatarUrl}
                    size="md"
                    className="inline"
                  />
                  <Typography variant="md">
                    {game.playerTwo.nickname}
                  </Typography>
                  <div
                    className={
                      game.playerTwoMatchPoints > 0
                        ? "text-success-200"
                        : "text-error-200"
                    }
                  >
                    {game.playerTwoMatchPoints > 0 ? "+" : ""}
                    {game.playerTwoMatchPoints}
                  </div>
                </div>
              </div>
            </Card.Body>
            <Card.Footer hr={false}>
              <Link to="/">
                <Button
                  className="justify-center w-full font-bold"
                  type="submit"
                  variant="primary"
                >
                  Home
                </Button>
              </Link>
            </Card.Footer>
          </Card>
        </>
      )}

      {gamePaused && (
        <>
          <Overlay />
          <Card className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-[1001] min-w-[27rem]">
            <Card.Title>
              <Typography variant="h6" customWeight="bold">
                Game Paused
              </Typography>
            </Card.Title>
            <Card.Body className="space-y-3">
              <Typography variant="lg" customWeight="bold">
                Users have <br />
                <strong>{remainingSeconds}</strong> seconds
                <br />
                to return to the game
              </Typography>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

export default Game;
