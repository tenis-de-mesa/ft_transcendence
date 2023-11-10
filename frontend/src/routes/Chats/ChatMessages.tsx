import { useEffect, useRef } from "react";
import { Chat, Message, User } from "../../types";
import { Avatar, Typography } from "../../components";

type ChatMessagesProps = {
  chat: Chat;
  handleClick: (user: User) => void;
};

export default function ChatMessages({ chat, handleClick }: ChatMessagesProps) {
  const refMessages = useRef<HTMLDivElement>(null);

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
              onClick={() => handleClick(message.sender)}
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
      {chat.messages.map(mapMessages)}
    </div>
  );
}
