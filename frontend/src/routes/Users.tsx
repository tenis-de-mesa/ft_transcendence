import { Link, useLoaderData, useRevalidator } from "react-router-dom";
import { socket } from "../socket";
import { useEffect, useMemo, useState } from "react";
import { User, UserStatus } from "../types/types";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import Table from "../components/Table";
import { BsFillChatDotsFill } from "react-icons/bs";
import { Data } from "../data";
import { RootUser } from "./Root";
import { FiCheck, FiPlus } from "react-icons/fi";
import { Badge } from "../components/Badge";
import { AddFriendButton } from "../components/AddFriendButton";
import { Avatar } from "../components/Avatar";

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const currentUser = RootUser();
  const loadedUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(loadedUsers);

  // When loadedUsers changes, update the users state
  useEffect(() => {
    setUsers(loadedUsers);
  }, [loadedUsers]);

  useEffect(() => {
    // Listen for user status updates from the server
    socket.on("userStatus", (data: UserStatus) => {
      // Update the status of the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // If the user is the one whose status has been updated, change their status
          if (user.id === data.id) {
            return { ...user, status: data.status };
          }
          // Otherwise, return the user as is
          return user;
        })
      );
    });

    // The current user is online by default
    setUsers((prevUsers) =>
      prevUsers.map((user) => {
        if (user.id === currentUser.id) {
          return { ...user, status: "online" };
        }
        return user;
      })
    );
  }, [currentUser.id]);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      columnHelper.accessor("nickname", {
        cell: (info) => (
          <Link
            to={`/profile/${info.row.original.id}`}
            className="flex items-center"
          >
            <Avatar
              className="mr-2"
              seed={info.row.original.login}
              size="sm"
              src={info.row.original.avatarUrl}
            />
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const isOnline = info.getValue();
          return isOnline == "online" ? (
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-success-500 mr-2"></div>
              <span className="text-success-500">Online</span>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="h-2.5 w-2.5 rounded-full bg-gray-500 mr-2"></div>
              <span className="text-gray-500">Offline</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("id", {
        header: "Action",
        cell: (info) => <AddFriendButton user={info.row.original} />,
      }),
    ],
    []
  );

  return (
    <>
      <Typography variant="h5">Users</Typography>

      <div className="h-[92%] mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={users as unknown as Data[]}
        />
      </div>
    </>
  );
}
