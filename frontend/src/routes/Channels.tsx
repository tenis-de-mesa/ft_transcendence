import { Link, useLoaderData } from "react-router-dom";
import { useMemo } from "react";
import { Chat } from "../types/types";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";
import Table from "../components/Table";
import { Data } from "../data";
import { Button } from "../components/Button";
import { RootUser } from "./Root";
import { Badge } from "../components/Badge";
import { joinChannel } from "../actions/joinChannel";

const columnHelper = createColumnHelper<Chat>();

export default function Channels() {
  const currentUser = RootUser();
  const [allChats, joinedChats] = useLoaderData() as [Chat[], []];
  const chats = allChats.filter(chat => chat.type !== "direct");

  const columns = useMemo<ColumnDef<Chat>[]>(
    () => [
      columnHelper.accessor("users", {
        header: "Owner",
        cell: (info) => <span>{info.getValue()[0].login}</span>,
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("id", {
        header: "Actions",
        cell: (props) => (
          <>
            {currentUser.id !== props.row.original.id ? (
              <>
                {joinedChats.length > 0 ? (
                  <Button
                    variant="error"
                    size="sm"
                    // onClick={() => leaveChannel(props.getValue())}
                  >
                    Leave
                  </Button>
                ) : (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => joinChannel(props.getValue())}
                  >
                    {JSON.stringify(props.getValue())}
                  </Button>
                )}
              </>
            ) : (
              <Link to={`/chats/${props.getValue()}`}>
                <Badge
                  variant="success"
                  size="lg"
                >
                  Owner
                </Badge>
              </Link>
            )}
          </>
        ),
      }),
    ],
    [],
  );

  return (
    <>
      <Typography variant="h5">Channels</Typography>

      <div className="h-[92%] mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={chats as unknown as Data[]}
        />
      </div>
    </>
  );
}
