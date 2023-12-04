import "./Profile.css";
import { Form, Link, useLoaderData } from "react-router-dom";
import { Game, User } from "../types";
import { AuthContext } from "../contexts";
import { useContext, useEffect, useMemo, useState } from "react";
import {
  ChatButton,
  Input,
  Typography,
  Button,
  Avatar,
  Card,
  AddFriendButton,
  UserUpdateAvatar,
  Alert,
} from "../components";
import { useWebSocket } from "../hooks";
import Table from "../components/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { IoChevronBackOutline } from "react-icons/io5";

const columnHelper = createColumnHelper<Game>();

export default function Profile() {
  const profileUser = useLoaderData() as User;
  const socket = useWebSocket();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [games, setGames] = useState([]);
  const [error, setError] = useState(false);

  const isViewingOwnProfile = currentUser.id === profileUser.id;

  const flipCard = () => {
    setError(false);
    const alternate = document.querySelector(".wrapper");
    if (alternate) {
      alternate.classList.toggle("flipped");
    }
  };

  const columns = useMemo<ColumnDef<Game>[]>(
    () => [
      columnHelper.accessor("playerOne", {
        header: "Player One",
        cell: (info) => info.getValue()?.nickname,
      }),
      columnHelper.accessor("playerTwo", {
        header: "Player Two",
        cell: (info) => info.getValue()?.nickname,
      }),
      columnHelper.accessor("playerOneScore", {
        header: "Score",
        cell: (info) => {
          const game = info.row.original;
          return (
            <div className="flex space-x-1">
              {`${game.playerOneScore} x ${game.playerTwoScore}`}
            </div>
          );
        },
      }),
    ],
    [],
  );

  useEffect(() => {
    socket.emit("getGameHistory", profileUser.id, (response) => {
      setGames(response);
    });
  }, [socket, profileUser.id]);

  const updateNickname = async (nickname: string) => {
    if (nickname.length > 16) {
      setError(true);
      return;
    }
    setError(false);

    await fetch("http://localhost:3001/users/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname }),
      credentials: "include",
    });
    setCurrentUser((prevUser) => ({ ...prevUser, nickname }));
    flipCard();
  };

  return (
    <div className="grid justify-center align-center h-4/5">
      <div className="grid justify-center align-center w-full h-full flip-card">
        <div className="wrapper self-center w-96">
          <Card className="card front">
            <Card.Title>
              <Avatar
                seed={currentUser.login}
                src={currentUser.avatarUrl}
                className="inline mt-5"
              />
            </Card.Title>
            <Card.Body>
              <>
                <Typography
                  customWeight="regular"
                  variant="h4"
                  className="mb-5"
                >
                  {currentUser.nickname}
                </Typography>
                <Typography customWeight="regular" variant="md">
                  <span className="flex justify-between gap-1">
                    <strong>Score:</strong>
                    {profileUser.totalMatchPoints}
                  </span>
                  <span className="flex justify-between gap-1">
                    <strong>Wins:</strong>
                    {profileUser.winCount}
                  </span>
                  <span className="flex justify-between gap-1">
                    <strong>Losses:</strong>
                    {profileUser.loseCount}
                  </span>
                </Typography>
                {isViewingOwnProfile && (
                  <Button
                    variant="info"
                    onClick={flipCard}
                    className="flex justify-center w-full mt-5"
                  >
                    Edit profile
                  </Button>
                )}
                <div className="flex flex-col gap-2 py-4">
                  <ChatButton user={profileUser} />
                  <AddFriendButton user={profileUser} />
                </div>
              </>
            </Card.Body>
          </Card>
          <Card className="card back">
            <div
              onClick={flipCard}
              className="absolute top-1 right-1 p-2 shadow-none cursor-pointer text-white"
            >
              <IoChevronBackOutline size={20} />
            </div>
            <Card.Title>
              <UserUpdateAvatar user={profileUser} />
            </Card.Title>
            <Card.Body position="left">
              <Typography
                customWeight="regular"
                variant="h4"
                className="flex justify-center mb-5"
              >
                {currentUser.nickname}
              </Typography>
              {error && (
                <Alert severity="error">
                  Nickname can't be longer than 16 characters
                </Alert>
              )}
              <Form>
                <Input
                  label="Nickname"
                  value={nickname}
                  error={error}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder=""
                  type="text"
                />
                <center>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full flex justify-center mt-4"
                    onClick={() => updateNickname(nickname)}
                  >
                    Update
                  </Button>
                </center>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="max-w-md">
        {(games.length > 0 && (
          <>
            <Typography variant="xl" className="text-center">
              Match history
            </Typography>
            <Table
              columns={columns as ColumnDef<unknown>[]}
              data={games}
              pageSize={4}
            />
          </>
        )) || (
          <>
            <div className="grid align-center content-center justify-center">
              <Typography variant="lg" className="text-center">
                There are no game history yet
              </Typography>
              <Link to="/" className="text-center p-3">
                <Button variant={"info"} size="lg" className="inline">
                  Go home and start playing!
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
