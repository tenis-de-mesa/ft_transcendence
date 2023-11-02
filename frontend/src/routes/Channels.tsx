import { Link, useLoaderData } from "react-router-dom";
import { useMemo } from "react";
import { Chat, User } from "../types/types";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";
import Table from "../components/Table";
import { Data } from "../data";
import { Button } from "../components/Button";
import { RootUser } from "./Root";
import { Badge } from "../components/Badge";
import { joinChannel } from "../actions/joinChannel";
import { leaveChannel } from "../actions/leaveChannel";
import { FiLock } from "react-icons/fi";

const columnHelper = createColumnHelper<Chat>();

export default function Channels() {
  const currentUser = RootUser();
  const [allChats, userList] = useLoaderData() as [
    Chat[],
    User[],
  ];

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
        cell: (info) => <span>{info.getValue()}</span>,
      }),
      columnHelper.accessor("id", {
        header: "Actions",
        cell: (props) => {
          const users = props.row.original.users;
          const joined = Boolean(users.find(user => user.userId === currentUser.id));
          
          return (
            <>
              {currentUser.id == props.row.original.createdByUser ? (
                <Link to={"/chats"}>
                  <Badge variant="success" size="lg">
                    Owner
                  </Badge>
                </Link>
              ) : (
                <>
                  {props.row.original.access == "public" ? (
                    <>
                      {joined && (
                        <Link to={"/chats"}>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => leaveChannel(props.getValue())}
                          >
                            Leave
                          </Button>
                        </Link>
                      ) || (
                        <Link to={"/chats/" + props.getValue()}>
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => joinChannel(props.getValue())}
                          >
                            Join
                          </Button>
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link to={"/chats/" + props.getValue()}>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => joinChannel(props.getValue())}
                        TrailingIcon={<FiLock />}
                      >
                        Join
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </>
          );
        },
      }),
    ],
    []
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
