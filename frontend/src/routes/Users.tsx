import { Link, useLoaderData } from "react-router-dom";
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
  const { currentUser } = useContext(AuthContext);
  const loadedUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(loadedUsers);

  const socket = useWebSocket();
  useEffect(() => setUsers(loadedUsers), [loadedUsers]);

  useEffect(() => {
    // The current user is online by default
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === currentUser.id) {
          return { ...user, status: "online" };
        }
        return user;
      })
    );
  }, [currentUser.id, users]);

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
                onClick={() =>
                  socket.emit("invitePlayerToGame", info.row.original)
                }
              >
                Play
              </Button>
            </>
          );
        },
      }),
    ],
    [socket]
  );

  return (
    <>
      <Typography variant="h5">Users</Typography>
      <div className="mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={users as unknown as Data[]}
        />
      </div>
    </>
  );
}
