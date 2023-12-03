import { Typography } from "../components/Typography";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Link, useLoaderData } from "react-router-dom";
import { Game } from "../types";
import Table from "../components/Table";
import { Button } from "../components";

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
    <>
      {games.length === 0 ? (
        <div className="grid align-center content-center justify-center h-full">
          <Typography variant="lg" className="text-center">
            There are no games on the Leaderboard yet.
          </Typography>
          <Link to="/" className="text-center p-3">
            <Button variant={"info"} size="lg" className="inline">
              Go home to join a game
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <Typography variant="h5" className="mb-6">
            Leaderboard
          </Typography>
          <Table
            columns={columns as unknown as ColumnDef<unknown>[]}
            data={games}
          />
        </>
      )}
    </>
  );
};

export default Games;
