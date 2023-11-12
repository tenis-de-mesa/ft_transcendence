import { useContext, useEffect, useState } from "react";
import { Form, useLoaderData } from "react-router-dom";
import { FiLock, FiUnlock } from "react-icons/fi";
import { Chat, User } from "../../types";
import { AuthContext, ChatContext } from "../../contexts";
import { Card, Typography, Button, Input } from "../../components";

import ChatProfileCard from "./ChatProfileCard";
import ChatChangePasswordCard from "./ChatChangePasswordCard";
import ChatMessages from "./ChatMessages";
import ChatMemberList from "./ChatMemberList";
import { socket } from "../../socket";

export default function Chat() {
  const chat = useLoaderData() as Chat;
  const { currentUser } = useContext(AuthContext);
  const { setCurrentChat } = useContext(ChatContext);

  // When a new chat is selected, update the current chat
  useEffect(() => {
    setCurrentChat(chat);
  }, [chat, setCurrentChat]);

  useEffect(() => {
    socket.emit("joinChat", chat.id);

    return () => {
      socket.emit("leaveChat", chat.id);
    };
  }, [chat.id]);

  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isChangePassCardOpen, setIsChangePassCardOpen] = useState(false);
  const [user, setUser] = useState<User>(null);
  const [userRole, setUserRole] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const isAdmin = userRole === "owner" || userRole === "admin";
  const chatId = chat.id;
  const members = chat.users.map((user) => user.userId);

  const isBlockedForOthers =
    chat.type === "direct" &&
    currentUser.blockedBy.find((user) => members.includes(user)) !== undefined;

  const isBlockedByMe =
    currentUser.blockedUsers.find((user) => members.includes(user)) !==
    undefined;

  useEffect(() => {
    const fetchChannelRole = async (chatId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3001/chats/${chatId}/role`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching channel role: ", error);
      }
    };

    fetchChannelRole(chatId).catch((error) =>
      console.error("Error setting channel role:", error)
    );
  }, [chatId]);

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
              IconOnly={chat.access === "public" ? <FiUnlock /> : <FiLock />}
              size="sm"
              variant="info"
              onClick={() => setIsChangePassCardOpen(!isChangePassCardOpen)}
            ></Button>
          )}
        </Card.Title>
        <Card.Body position="left" className="pt-0 h-5/6">
          {isProfileCardOpen && (
            <ChatProfileCard
              user={user}
              handleClose={() => setIsProfileCardOpen(false)}
            />
          )}

          {isChangePassCardOpen && (
            <ChatChangePasswordCard
              handleClose={() => setIsChangePassCardOpen(false)}
            />
          )}

          <ChatMessages
            handleClick={(user) => {
              setUser(user);
              setIsProfileCardOpen(true);
            }}
          />

          <Form method="POST" onSubmit={() => setNewMessage("")}>
            <Input
              type="text"
              value={newMessage}
              name="message"
              placeholder={
                isBlockedForOthers
                  ? "You have been blocked"
                  : isBlockedByMe
                  ? "You blocked this user"
                  : "Enter your message"
              }
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isBlockedForOthers || isBlockedByMe}
            />
          </Form>
        </Card.Body>
      </Card>

      {chat.type === "channel" && <ChatMemberList members={chat.users} />}
    </div>
  );
}
