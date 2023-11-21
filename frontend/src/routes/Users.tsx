import {
  Link,
  Navigate,
  redirect,
  useLoaderData,
  useNavigate,
} from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { User } from "../types";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";
import Table from "../components/Table";
import { Data } from "../data";
import { AddFriendButton } from "../components/AddFriendButton";
import { AuthContext } from "../contexts";
import { UserWithStatus } from "../components/UserWithStatus";
import { Button } from "../components";
import { useWebSocket } from "../hooks";

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const loadedUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(loadedUsers);

  const [invites, setInvites] = useState([]);

  const socket = useWebSocket();

  const handleGameInvite = (player) => {
    socket.emit("findMyInvites", player.id, (listInvites) => {
      console.log(invites);
      setInvites(listInvites);
    });
  };

  const submitGameInvite = function (player) {
    socket.emit("invitePlayerToGame", player.id);
  };

  const acceptGameInvite = function (playerId) {
    socket.emit("acceptInvitePlayerToGame", playerId);
  };

  useEffect(() => setUsers(loadedUsers), [loadedUsers]);

  useEffect(() => {
    socket.on("gameAvailable", (gameId) => {
      navigate(`/games/${gameId}`);
    });

    return () => {
      socket.off("gameAvailable");
    };
  }, [navigate, socket]);

  useEffect(() => {
    // The current user is online by default
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === currentUser.id) {
          return { ...user, status: "online" };
        }
        return user;
      }),
    );
  }, [currentUser.id]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      columnHelper.accessor("nickname", {
        header: "Name",
        cell: (info) => (
          <Link to={`/profile/${info.row.original.id}`}>
            <UserWithStatus user={info.row.original} />
          </Link>
        ),
      }),
      columnHelper.accessor("id", {
        header: "Action",
        cell: (info) => {
          return (
            <>
              <AddFriendButton user={info.row.original} />

              <Button
                variant="error"
                onClick={() => submitGameInvite(info.row.original)}
              >
                Play
              </Button>
            </>
          );
        },
      }),
    ],
    [],
  );

  return (
    <>
      <Typography variant="h5">Users</Typography>
      <Button variant="info" onClick={() => handleGameInvite(currentUser)}>
        Show my invites
      </Button>
      <div>
        {invites.map((i) => {
          return (
            <div className="text-white">
              {i.nickname}
              <Button variant="info" onClick={() => acceptGameInvite(i.id)}>
                Aceitar
              </Button>
            </div>
          );
        })}
      </div>
      <div className="h-[92%] mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={users as unknown as Data[]}
        />
      </div>
    </>
  );
}
function redirectDocument(arg0: string): void {
  throw new Error("Function not implemented.");
}
