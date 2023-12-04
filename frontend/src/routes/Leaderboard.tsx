import { useMemo } from "react";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";

import Table from "../components/Table";
import { User } from "../types";
import { Link, useLoaderData } from "react-router-dom";
import { UserWithStatus } from "../components";

const columnHelper = createColumnHelper<User>();

const Leaderboard = () => {
  const users: User[] = (useLoaderData() as User[]).sort(
    (a, b) => b.winCount - a.winCount,
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      columnHelper.accessor("nickname", {
        header: "User",
        cell: (info) => {
          return (
            <Link to={`/profile/${info.row.original.id}`}>
              <UserWithStatus user={info.row.original} />
            </Link>
          );
        },
      }),
      columnHelper.accessor("totalMatchPoints", {
        header: "Score",
      }),
      columnHelper.accessor("winCount", {
        header: "Wins",
      }),
      columnHelper.accessor("loseCount", {
        header: "Loses",
      }),
    ],
    [],
  );

  return (
    <>
      <Typography variant="h5">Leaderboard</Typography>

      <div className="h-[92%] mt-6">
        <Table columns={columns as ColumnDef<unknown>[]} data={users} />
      </div>
    </>
  );
};

export default Leaderboard;
