import { Link, Outlet } from "react-router-dom";
import { Card, Typography } from "../../components";
import NewChannelButton from "./NewChannelButton";
import { useContext } from "react";
import ChatContext from "../../contexts/ChatContext";

export default function Chats() {
  const { chatList } = useContext(ChatContext);

  return (
    <div className="flex flex-row justify-between h-full gap-3">
      <div className="w-1/4">
        <Card className="h-full">
          <Card.Title>
            <Typography variant="h6">Chats</Typography>
          </Card.Title>
          <Card.Body className="h-full pt-0">
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

      <div className="w-3/4 h-full">
        <Outlet />
      </div>
    </div>
  );
}
