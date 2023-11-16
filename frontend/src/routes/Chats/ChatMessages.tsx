import { useContext, useEffect, useRef, useState } from "react";
import { Message } from "../../types";
import { Avatar, Typography } from "../../components";
import { ChatContext } from "../../contexts";
import { socket } from "../../socket";

import ChatProfileCard from "./ChatProfileCard";

export default function ChatMessages() {
  const { currentChat, setShowCard } = useContext(ChatContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const refMessages = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentChat) {
      setMessages(currentChat.messages);
    }
  }, [currentChat]);

  useEffect(() => {
    socket.on("newMessage", (data: Message) => {
      setMessages((messages) => [...messages, data]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  useEffect(() => {
    const scrollHeight = refMessages.current.scrollHeight;
    const height = refMessages.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    refMessages.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  });

  const mapMessages = (
    message: Message,
    index: number,
    messages: Message[]
  ) => {
    const currentMessage = messages[index];
    const lastMessage = messages[index - 1];
    const showHeader =
      messages.length === 1 ||
      !lastMessage ||
      lastMessage.sender.id !== currentMessage.sender.id;

    return (
      <div key={message.id}>
        {showHeader && (
          <div className="flex gap-4 mt-5">
            <Avatar
              seed={message.sender?.login}
              src={message.sender?.avatarUrl}
              size="sm"
            />
            <div
              onClick={() =>
                setShowCard(<ChatProfileCard user={message?.sender} />)
              }
              className="cursor-pointer"
            >
              <Typography variant="h6">
                {message.sender?.nickname ?? "Deleted user"}
              </Typography>
            </div>
          </div>
        )}

        <Typography variant="sm" className="ml-14">
          {message.content}
        </Typography>
      </div>
    );
  };

  return (
    <div
      ref={refMessages}
      className="h-full mb-4 overflow-scroll break-words no-scrollbar"
    >
      {messages.map(mapMessages)}
    </div>
  );
}
