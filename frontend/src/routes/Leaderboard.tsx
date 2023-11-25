import { useMemo } from "react";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";

import Table from "../components/Table";
import { User } from "../types";
import { useLoaderData } from "react-router-dom";
import { UserWithStatus } from "../components";

const columnHelper = createColumnHelper<User>();

const Leaderboard = () => {
  const users: User[] = (useLoaderData() as User[]).sort(
    (a, b) => b.winCount - a.winCount,
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      columnHelper.accessor("id", {
        cell: (info) => (
          <span className="font-bold dark:text-gray-50">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("nickname", {
        header: () => <span>Nickname</span>,
        cell: (info) => <i>{info.getValue()}</i>,
      }),
      columnHelper.accessor("winCount", {
        header: "Wins",
      }),
      columnHelper.accessor("loseCount", {
        header: "Loses",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          return <UserWithStatus user={info.row.original} />;
        },
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
