import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useLoaderData } from "react-router-dom";
import { Card, Typography } from "../../components";
import { Chat } from "../../types";
import { socket } from "../../socket";
import { AuthContext, ChatContext } from "../../contexts";

import NewChannelButton from "./NewChannelButton";

export default function Chats() {
  const chats = useLoaderData() as Chat[];
  const { currentUser } = useContext(AuthContext);
  const { currentChat } = useContext(ChatContext);
  const [chatList, setChatList] = useState<Chat[]>([]);

  useEffect(() => {
    setChatList(chats);
  }, [chats, setChatList]);

  useEffect(() => {
    socket.on("userRemoved", (id: number) => {
      if (id === currentUser?.id)
        setChatList(chatList.filter((chat) => chat.id !== currentChat?.id));
    });
  }, [chatList, setChatList, currentChat?.id, currentUser?.id]);

  return (
    <div className="flex flex-row justify-between h-full gap-3">
      <div className="w-1/6">
        <Card className="h-full">
          <Card.Title>
            <Typography variant="h6">Chats</Typography>
          </Card.Title>
          <Card.Body className="h-full">
            <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
              <div className="flex flex-col gap-2 text-left">
                {chatList.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chats/${chat.id}`}
                    state={{ id: chat.id }}
                  >
                    <Typography variant="sm">{chat.name}</Typography>
                  </Link>
                ))}
              </div>
              <NewChannelButton />
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="w-5/6 h-full">
        <Outlet />
      </div>
    </div>
  );
}
