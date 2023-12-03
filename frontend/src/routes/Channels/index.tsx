import { useContext, useMemo } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Chat } from "../../types";

import Table from "../../components/Table";
import { Button, Typography } from "../../components";
import { AuthContext } from "../../contexts";

import ActionChannelButton from "./ActionChannelButton";

const columnHelper = createColumnHelper<Chat>();

export default function Channels() {
  const { currentUser } = useContext(AuthContext);
  const chats = useLoaderData() as Chat[];
  const channels = chats.filter((chat) => {
    if (chat.type !== "channel") {
      return null;
    }

    if (chat.access === "private") {
      const isMember = chat.users.find((m) => m.userId === currentUser?.id);

      if (!isMember) {
        return null;
      }
    }

    return chat;
  });

  const capitalizeFirstLetter = (s: string) => {
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const columns = useMemo<ColumnDef<Chat>[]>(
    () => [
      columnHelper.accessor("id", {
        header: "#",
        cell: (props) => (
          <Link to={`/chats/${props.getValue()}`}>{props.getValue()}</Link>
        ),
      }),
      columnHelper.accessor("owner", {
        header: "Owner",
        cell: (props) => {
          const owner = props.getValue();

          return (
            <>
              {owner ? (
                <Link
                  to={`/profile/${owner.id}`}
                  className="hover:text-info-500"
                >
                  {owner.nickname}
                </Link>
              ) : (
                <span className="text-gray-500">Deleted user</span>
              )}
            </>
          );
        },
      }),
      columnHelper.accessor("access", {
        header: "Access",
        cell: (props) => <span>{capitalizeFirstLetter(props.getValue())}</span>,
      }),
      columnHelper.accessor("users", {
        header: "Your Role",
        cell: (props) => {
          const members = props.getValue();
          const current = members.find((m) => m.userId === currentUser.id);
          const role = current?.role ?? "--";

          return <span>{capitalizeFirstLetter(role)}</span>;
        },
      }),
      columnHelper.display({
        header: "Actions",
        cell: (props) => {
          const members = props.row.original.users;
          const id = props.row.original.id;
          const access = props.row.original.access;
          const isOwner = props.row.original.owner?.id == currentUser.id;
          const isMember = members.some((m) => m.userId === currentUser.id);

          return (
            <ActionChannelButton
              id={id}
              access={access}
              isMember={isMember}
              isOwner={isOwner}
            />
          );
        },
      }),
    ],
    [currentUser?.id]
  );

  return (
    <>
      {channels.length === 0 ? (
        <div className="grid align-center content-center justify-center h-full">
          <Typography variant="lg" className="text-center">
            There are no channels yet.
          </Typography>
          <Link to="/chats" className="text-center p-3">
            <Button variant={"info"} size="lg" className="inline">
              Go to chat
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
            data={channels}
          />
        </>
      )}
    </>
  );
}
