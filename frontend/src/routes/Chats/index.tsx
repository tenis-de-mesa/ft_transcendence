import { Link, NavLink, Outlet, useLoaderData } from "react-router-dom";
import { Card, Typography } from "../../components";
import { Chat } from "../../types";

import NewChannelButton from "./NewChannelButton";

export default function Chats() {
  const chatList = useLoaderData() as Chat[];

  return (
    <div className="flex flex-row justify-between h-full gap-3">
      <div className="w-1/4">
        <div className="flex flex-col h-full relative">
          <Card className="h-full">
            <Card.Title>
              <Typography variant="h6">Chats</Typography>
            </Card.Title>
            <Card.Body position="left">
              <div className="flex flex-col justify-between">
                {chatList.map((chat) => (
                  <NavLink
                    key={chat.id}
                    to={`/chats/${chat.id}`}
                    state={{ id: chat.id }}
                    // Make it bold if it's the current chat
                    className={`${
                      chat.id === chatList[0].id ? "font-bold" : ""
                    }`}
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
    </div>
  );
}
