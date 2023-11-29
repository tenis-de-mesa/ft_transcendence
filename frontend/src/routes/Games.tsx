import { Typography } from "../components/Typography";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Link, useLoaderData } from "react-router-dom";
import { Game } from "../types";
import Table from "../components/Table";

const Games = () => {
  const games = useLoaderData() as Game[];
  const columnHelper = createColumnHelper<Game>();

  const columns = [
    columnHelper.accessor("id", {
      header: "#",
      cell: (info) => {
        return (
          <Link to={`/games/${info.getValue()}`} className="flex space-x-1">
            {info.getValue()}
          </Link>
        );
      },
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
      <Typography variant="h5" className="mb-5">
        Games
      </Typography>
      <Table columns={columns as ColumnDef<unknown>[]} data={games} />
    </div>
  );
};

export default Games;
