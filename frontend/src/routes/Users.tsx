import { Link, useLoaderData } from "react-router-dom";
import { socket } from "../socket";
import { useEffect, useMemo, useState } from "react";
import { User, UserStatus } from "../types/types";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import Table from "../components/Table";
import { BsFillChatDotsFill } from "react-icons/bs";
import { Data } from "../data";

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const initialUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(initialUsers);

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
        }),
      );
    });
  }, []);

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      columnHelper.accessor("nickname", {
        header: "Nickname",
        cell: (info) => <i>{info.getValue()}</i>,
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
        cell: (info) => {
          return (
            <div key={info.getValue()}>
              <Link to={`/chats/with/${info.getValue()}`}>
                <Button
                  variant="info"
                  size="sm"
                  TrailingIcon={<BsFillChatDotsFill />}
                >
                  Chat
                </Button>
              </Link>
            </div>
          );
        },
      }),
    ],
    [],
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
