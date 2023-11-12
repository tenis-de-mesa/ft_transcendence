import { useContext, useMemo } from "react";
import { useLoaderData } from "react-router-dom";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { Chat, User } from "../../types";

import Table from "../../components/Table";
import { Typography } from "../../components";
import { Data } from "../../data";
import { AuthContext } from "../../contexts";

import ActionChannelButton from "./ActionChannelButton";

const columnHelper = createColumnHelper<Chat>();

export default function Channels() {
  const { currentUser } = useContext(AuthContext);
  const [allChats, userList] = useLoaderData() as [Chat[], User[]];

  const chats = allChats.filter((chat) => chat.type !== "direct");

  const columns = useMemo<ColumnDef<Chat>[]>(
    () => [
      columnHelper.accessor("createdByUser", {
        header: "Owner",
        cell: (props) => {
          let usr = "";
          userList.forEach((user) => {
            if (user.id == props.getValue()) {
              usr = user.login;
            }
          });
          return <span>{usr}</span>;
        },
      }),
      columnHelper.accessor("access", {
        header: "Access",
        cell: (props) => <span>{props.getValue()}</span>,
      }),
      columnHelper.accessor("id", {
        header: "Actions",
        cell: (props) => {
          const users = props.row.original.users;
          const id = props.getValue();
          const access = props.row.original.access;
          const isOwner = props.row.original.createdByUser === currentUser.id;
          const isMember = users.some((user) => user.userId === currentUser.id);

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
    [currentUser.id, userList]
  );

  return (
    <>
      <Typography variant="h5">Channels</Typography>
      <div className="mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={chats as unknown as Data[]}
        />
      </div>
    </>
  );
}
