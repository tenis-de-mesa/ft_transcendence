import { Link, useLoaderData } from "react-router-dom";
import { Game, User } from "../types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";
import UserUpdateAvatar from "../components/UserUpdateAvatar";
import { AddFriendButton } from "../components/AddFriendButton";
import { AuthContext } from "../contexts";
import { useContext, useEffect, useMemo, useState } from "react";
import { ChatButton, UserWithStatus } from "../components";
import { useWebSocket } from "../hooks";
import Table from "../components/Table";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<Game>();

export default function Profile() {
  const { currentUser } = useContext(AuthContext);
  const profileUser = useLoaderData() as User; // loadUserById
  const socket = useWebSocket();
  const [gameHistory, setGameHistory] = useState([]);

  const isViewingOwnProfile = currentUser.id === profileUser.id;

  const flipCard = () => {
    const alternate = document.querySelector(".flip-card .wrapper");
    if (alternate) {
      alternate.classList.toggle("flipped");
    }
  };

  const columns = useMemo<ColumnDef<Game>[]>(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("playerOne", {
        header: "Player One",
        cell: (info) => {
          return (
            <div className="flex space-x-1">{info.getValue().nickname}</div>
          );
        },
      }),
      columnHelper.accessor("playerTwo", {
        header: "Player Two",
        cell: (info) => {
          return (
            <div className="flex space-x-1">{info.getValue().nickname}</div>
          );
        },
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
    []
  );

  useEffect(() => {
    socket.emit("getGameHistory", profileUser.id, (response) => {
      setGameHistory(response);
    });
  }, [socket, profileUser.id]);

  return (
    <div className="profile h-full">
      <div className="flip-card grid">
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
                    <strong>Login:</strong>
                    {profileUser.login}
                  </span>
                  <span className="flex justify-between gap-1">
                    <strong>Nickname:</strong>
                    {profileUser.nickname}
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
              <UserForm user={profileUser} />
            </Card.Body>
          </Card>
        </div>
      </div>
      <div className="mt-6">
        <Table columns={columns as any} data={gameHistory as any} />
      </div>
    </div>
  );
}
