import { Typography } from "../components/Typography";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useLoaderData } from "react-router-dom";
import { Game } from "../types";
import Table from "../components/Table";

const Games = () => {
  const games = useLoaderData() as Game[];
  const columnHelper = createColumnHelper<Game>();

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("playerOne", {
      header: "Player One",
      cell: (info) => {
        return (
          <div className="flex space-x-1">{info.getValue()?.nickname}</div>
        );
      },
    }),
    columnHelper.accessor("playerTwo", {
      header: "Player Two",
      cell: (info) => {
        return (
          <div className="flex space-x-1">{info.getValue()?.nickname}</div>
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
  ];

  return (
    <div>
      <Typography variant="h4" className="mb-10">
        Games
      </Typography>
      <Table columns={columns as ColumnDef<unknown>[]} data={games} />
    </div>
  );
};

export default Games;
