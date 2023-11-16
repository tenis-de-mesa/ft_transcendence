import { useContext, useEffect, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { FaGear } from "react-icons/fa6";
import { Chat } from "../../types";
import { AuthContext, ChatContext } from "../../contexts";
import { Card, Typography, Button } from "../../components";
import { socket } from "../../socket";

import ChatMessages from "./ChatMessages";
import ChatMemberList from "./ChatMemberList";
import ChatMessageInput from "./ChatMessageInput";
import ChatSettingsCard from "./ChatSettingsCard";

export default function Chat() {
  const chat = useLoaderData() as Chat;
  const { currentUser } = useContext(AuthContext);
  const { setCurrentChat, userRole, userStatus, setShowCard } =
    useContext(ChatContext);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => setCurrentChat(chat), [chat, setCurrentChat]);

  useEffect(() => setIsMuted(userStatus === "muted"), [userStatus]);

  useEffect(() => {
    socket.emit("joinChat", chat.id);

    socket.on("userMuted", (muteUserId: number) => {
      if (muteUserId === currentUser?.id) {
        setIsMuted(true);
      }
    });

    socket.on("userUnmuted", (unmuteUserId: number) => {
      if (unmuteUserId === currentUser?.id) {
        setIsMuted(false);
      }
    });

    return () => {
      socket.emit("leaveChat", chat.id);
      socket.off("userMuted");
      socket.off("userUnmuted");
    };
  }, [chat, currentUser?.id]);

  const isAdmin = userRole === "owner" || userRole === "admin";
  const members = chat.users.map((user) => user.userId);

  const isBlockedForOthers =
    currentUser.blockedBy.find((user) => members.includes(user)) !== undefined;

  const isBlockedByMe =
    currentUser.blockedUsers.find((user) => members.includes(user)) !==
    undefined;

  return (
    <div className="flex h-full gap-3">
      <Card className="w-full h-full">
        <Card.Title
          hr={false}
          className="relative px-4 min-h-[60px] shadow-[0px_10px_5px_-5px] shadow-gray-900/50"
        >
          <Typography
            className="absolute left-1/2 -translate-x-1/2"
            variant="h6"
          >
            Chat {chat.id}
          </Typography>

          {isAdmin && chat.access !== "private" && (
            <Button
              className="absolute right-[16px]"
              IconOnly={<FaGear />}
              title="Settings"
              size="sm"
              variant="info"
              onClick={() => setShowCard(<ChatSettingsCard />)}
            ></Button>
          )}
        </Card.Title>
        <Card.Body position="left" className="pt-0 h-5/6">
          <ChatMessages />

          <ChatMessageInput
            disabled={
              isMuted ||
              ((isBlockedByMe || isBlockedForOthers) && chat.type === "direct")
            }
          />
        </Card.Body>
      </Card>

      {chat.type === "channel" && (
        <ChatMemberList initialMembers={chat.users} />
      )}
    </div>
  );
}
