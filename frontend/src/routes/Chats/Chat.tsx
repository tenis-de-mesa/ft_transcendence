import { useContext, useEffect, useState } from "react";
import { Form, useLoaderData, useRevalidator } from "react-router-dom";
import { FiLock, FiUnlock } from "react-icons/fi";
import { socket } from "../../socket";
import { Chat, Message, User } from "../../types";
import { AuthContext } from "../../contexts";
import { Card, Typography, Button, Input } from "../../components";
import ChatProfileCard from "./ChatProfileCard";
import ChatChangePasswordCard from "./ChatChangePasswordCard";
import ChatMessages from "./ChatMessages";
import ChatContext from "../../contexts/ChatContext";

export default function Chat() {
  const { currentUser } = useContext(AuthContext);
  const { currentChat, setCurrentChat } = useContext(ChatContext);

  // When a new chat is selected, update the current chat
  const loaderData = useLoaderData() as Chat;
  useEffect(() => {
    setCurrentChat(loaderData);
  }, [loaderData, setCurrentChat]);

  const revalidator = useRevalidator();

  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isChangePassCardOpen, setIsChangePassCardOpen] = useState(false);
  const [user, setUser] = useState<User>(null);
  const [userRole, setUserRole] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const isAdmin = userRole === "owner" || userRole === "admin";
  const chatId = currentChat.id;
  const members = currentChat.users.map((user) => user.id);

  const isBlockedForOthers =
    currentChat.type === "direct" &&
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

  useEffect(() => {
    socket.on(`newMessage`, (data: Message) => {
      // If the message is not from the current chat, ignore it
      if (data.chat!.id != chatId) return;

      if (!currentChat.messages.find((message) => message.id == data.id)) {
        currentChat.messages.push(data);
        revalidator.revalidate();
      }
    });
  }, [currentChat.messages, chatId, revalidator]);

  return (
    <Card className="w-full h-full">
      <Card.Title
        hr={false}
        className="flex justify-between items-center min-h-[60px] shadow-[0px_10px_5px_-5px] shadow-gray-900/50"
      >
        {/* TODO: Make it so button does not dislocate chat name */}
        <Typography className="flex-1" variant="h6">
          Chat {currentChat.id}
        </Typography>
        {isAdmin && currentChat.access !== "private" && (
          <Button
            IconOnly={
              currentChat.access === "public" ? <FiUnlock /> : <FiLock />
            }
            size="sm"
            variant="info"
            onClick={() => setIsChangePassCardOpen(!isChangePassCardOpen)}
            className=""
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
  );
}
