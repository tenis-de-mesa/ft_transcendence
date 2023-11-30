import "./Profile.css";
import { Form, useLoaderData } from "react-router-dom";
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
} from "../components";
import { useWebSocket } from "../hooks";
import Table from "../components/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Game>();

export default function Profile() {
  const profileUser = useLoaderData() as User;
  const socket = useWebSocket();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [nickname, setNickname] = useState(currentUser.nickname);
  const [games, setGames] = useState([]);

  const isViewingOwnProfile = currentUser.id === profileUser.id;

  const flipCard = () => {
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
    <div className="grid justify-center align-center gap-3 h-full">
      <div className="grid justify-center align-center w-full h-full flip-card">
        <div className="wrapper self-center">
          <Card className="card front">
            <Card.Title>
              <>
                {isViewingOwnProfile ? (
                  <>
                    <Avatar
                      seed={currentUser.login}
                      src={currentUser.avatarUrl}
                      className="inline"
                    />
                    <Typography customWeight="regular" variant="h4">
                      {currentUser.nickname}
                    </Typography>
                    <Button
                      variant="info"
                      onClick={flipCard}
                      className="absolute top-0 right-0 p-2 shadow-none"
                    >
                      Editar
                    </Button>
                  </>
                ) : (
                  <>
                    <Avatar
                      seed={profileUser.login}
                      src={profileUser.avatarUrl}
                      className="inline"
                    />
                    <Typography customWeight="regular" variant="h4">
                      {profileUser.nickname}
                    </Typography>
                  </>
                )}
              </>
            </Card.Title>
            <Card.Body>
              <>
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
                <div className="flex flex-col gap-2 py-4">
                  <ChatButton user={profileUser} />
                  <AddFriendButton user={profileUser} />
                </div>
              </>
            </Card.Body>
          </Card>
          <Card className="card back">
            <Button
              variant="info"
              onClick={flipCard}
              className="absolute top-0 left-0 p-2 shadow-none"
            >
              Voltar
            </Button>
            <Card.Title>
              <UserUpdateAvatar user={profileUser} />
            </Card.Title>
            <Card.Body position="left">
              <Form>
                <Input
                  label="Nickname"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder=""
                  type="text"
                />
                <center>
                  <Button
                    variant="primary"
                    size="sm"
                    className="inline m-2"
                    onClick={() => updateNickname(nickname)}
                  >
                    Atualizar
                  </Button>
                </center>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="max-w-md">
        {games.length > 0 && (
          <>
            <Typography variant="h6" className="text-center">
              Latest games
            </Typography>
            <Table
              columns={columns as ColumnDef<unknown>[]}
              data={games}
              pageSize={5}
            />
          </>
        )}
      </div>
    </div>
  );
}
