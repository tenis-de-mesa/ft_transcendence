import { Form, Link, useLoaderData } from "react-router-dom";
import { useContext, useEffect, useMemo, useState } from "react";
import { Chat, User } from "../types/types";

import { ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { Typography } from "../components/Typography";
import Table from "../components/Table";
import { Data } from "../data";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { joinChannel } from "../actions/joinChannel";
import { leaveChannel } from "../actions/leaveChannel";
import { FiLock } from "react-icons/fi";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Alert } from "../components/Alert";
import { AuthContext } from "../contexts";

const columnHelper = createColumnHelper<Chat>();

export default function Channels() {
  const { currentUser } = useContext(AuthContext);
  const [allChats, userList] = useLoaderData() as [Chat[], User[]];

  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<number | undefined>(undefined);
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);

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
          const joined = Boolean(
            users.find((user) => user.userId === currentUser.id)
          );

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
                      {(joined && (
                        <Link to={"/chats"}>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => leaveChannel(props.getValue())}
                          >
                            Leave
                          </Button>
                        </Link>
                      )) || (
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
                    <>
                      {(joined && (
                        <Link to={"/chats"}>
                          <Button
                            variant="error"
                            size="sm"
                            onClick={() => leaveChannel(props.getValue())}
                          >
                            Leave
                          </Button>
                        </Link>
                      )) || (
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => {
                            setIsOpen(true);
                            setChatId(props.getValue());
                          }}
                          TrailingIcon={<FiLock />}
                        >
                          Join
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}
            </>
          );
        },
      }),
    ],
    [currentUser.id, userList]
  );

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#join-channel")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const handleProtectedChannelJoin = () => {
    joinChannel(chatId, password).then((isValid) => {
      if (!isValid) {
        setIsError(true);
        setPassword("");
      } else {
        setIsError(false);
        setPassword("");
        setIsOpen(false);
      }
    });
  };

  return (
    <>
      <Typography variant="h5">Channels</Typography>

      <div className="h-[92%] mt-6">
        <Table
          columns={columns as unknown as ColumnDef<Data>[]}
          data={chats as unknown as Data[]}
        />
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[1000] bg-gray-900/50"></div>
            <div
              id="join-channel"
              className="absolute z-[1001] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            >
              <Card className="w-96">
                <Card.Body position="left" className="space-y-4">
                  <>
                    <Form
                      onSubmit={handleProtectedChannelJoin}
                      className="space-y-2"
                    >
                      <Input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setIsError(false);
                        }}
                        placeholder="Channel password"
                      />
                      <Button
                        className="justify-center w-full"
                        type="submit"
                        variant="info"
                        disabled={password.length === 0}
                      >
                        Join
                      </Button>
                    </Form>

                    {isError && (
                      <Alert severity="error" className="w-full">
                        Invalid password
                      </Alert>
                    )}
                  </>
                </Card.Body>
              </Card>
            </div>
          </>
        )}
      </div>
    </>
  );
}
