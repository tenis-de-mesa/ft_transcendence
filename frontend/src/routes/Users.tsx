import { Link, useLoaderData } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { User } from "../types";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Typography } from "../components/Typography";
import Table from "../components/Table";
import { Data } from "../data";
import { AddFriendButton, InviteGameButton } from "../components";
import { UserWithStatus } from "../components/UserWithStatus";

const columnHelper = createColumnHelper<User>();

export default function Users() {
  const loadedUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(loadedUsers);

  useEffect(() => setUsers(loadedUsers), [loadedUsers]);

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
            <div className="flex gap-3">
              <AddFriendButton user={info.row.original} />
              <InviteGameButton user={info.row.original} />
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
      <div className="mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={users as unknown as Data[]}
        />
      </div>
    </>
  );
}
