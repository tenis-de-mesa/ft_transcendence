import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet, useLoaderData } from "react-router-dom";
import { Card, Overlay, Typography } from "../../components";
import { Chat } from "../../types";
import { socket } from "../../socket";
import { AuthContext, ChatContext } from "../../contexts";

import NewChannelButton from "./NewChannelButton";

export default function Chats() {
  const chats = useLoaderData() as Chat[];
  const { currentUser } = useContext(AuthContext);
  const { currentChat, showCard } = useContext(ChatContext);
  const [chatList, setChatList] = useState<Chat[]>([]);

  useEffect(() => {
    setChatList(chats);
  }, [chats, setChatList]);

  useEffect(() => {
    socket.on("userRemoved", (id: number) => {
      if (id === currentUser?.id) {
        setChatList(chatList.filter((chat) => chat.id !== currentChat?.id));
      }
    });

    socket.on("newChat", (chat: Chat) => {
      if (!chatList.find((c) => c.id === chat.id)) {
        setChatList([...chatList, chat]);
      }
    });

    socket.on("userBanned", (id: number) => {
      if (id === currentUser?.id) {
        setChatList(chatList.filter((chat) => chat.id !== currentChat?.id));
      }
    });
  }, [chatList, setChatList, currentChat?.id, currentUser?.id]);

  return (
    <div className="flex flex-row justify-between h-full gap-3">
      <div className="w-1/4">
        <div className="flex flex-col h-full relative">
          <Card className="h-full">
            <Card.Title>
              <Typography variant="h6">Chats</Typography>
            </Card.Title>
            <Card.Body position="left" className="h-full overflow-y-auto">
              <div className="flex flex-col justify-between">
                {chatList.map((chat) => (
                  <NavLink
                    key={chat.id}
                    to={`/chats/${chat.id}`}
                    state={{ id: chat.id }}
                  >
                    <Typography variant="sm">{chat.name}</Typography>
                  </NavLink>
                ))}
              </div>
            </Card.Body>
          </Card>
          <span className="absolute bottom-0 left-0 right-0 p-3">
            <NewChannelButton />
          </span>
        </div>
      </div>

      <div className="w-full h-full">
        <Outlet />
      </div>

      {showCard && (
        <>
          <Overlay />
          {showCard}
        </>
      )}
    </div>
  );
}
