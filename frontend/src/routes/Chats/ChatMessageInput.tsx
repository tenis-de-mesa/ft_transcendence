import { FormEvent, useContext, useEffect, useState } from "react";
import { useFetcher, useParams } from "react-router-dom";
import { Input } from "../../components";
import { AuthContext, ChatContext } from "../../contexts";
import { useWebSocket } from "../../hooks";

interface ChatMessageInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}

interface Block {
  isBlocked: boolean;
  message: string;
}

export default function ChatMessageInput({ ...props }: ChatMessageInputProps) {
  const socket = useWebSocket();
  const params = useParams();
  // TODO: retrieve errors from action
  const { Form } = useFetcher();
  const { currentUser } = useContext(AuthContext);
  const { currentChat, userStatus } = useContext(ChatContext);
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState<Block>({
    isBlocked: false,
    message: "",
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    const newMessage = message.trim();
    if (!newMessage.length) {
      return;
    }

    socket.emit("sendChatMessage", {
      message: newMessage,
      chatId: params.id!,
    });
  };

  useEffect(() => {
    if (currentChat?.type === "direct") {
      const youBlockedUser =
        currentUser?.blockedUsers.find(
          (user) => currentChat?.users.find((u) => u.userId === user),
        ) !== undefined;

      if (youBlockedUser) {
        return setBlocked({
          isBlocked: true,
          message: "You blocked this user",
        });
      }

      const userBlockedYou =
        currentUser?.blockedBy.find(
          (user) => currentChat?.users.find((u) => u.userId === user),
        ) !== undefined;

      if (userBlockedYou) {
        return setBlocked({
          isBlocked: true,
          message: "You are blocked by this user",
        });
      }
    } else if (currentChat?.type === "channel") {
      if (userStatus === "muted") {
        return setBlocked({
          isBlocked: true,
          message: "You are currently muted in this channel",
        });
      }
    }

    return setBlocked({
      isBlocked: false,
      message: "",
    });
  }, [userStatus, currentChat, currentUser]);

  useEffect(() => {
    socket.on(
      "userBlocked",
      (payload: { blockedUserId: number; blockingUserId: number }) => {
        const { blockedUserId, blockingUserId } = payload;

        if (currentChat?.type === "direct") {
          if (
            blockedUserId === currentUser?.id &&
            currentChat?.users.find((u) => u.userId === blockingUserId)
          ) {
            setBlocked({
              isBlocked: true,
              message: "You are blocked by this user",
            });
          } else if (
            blockingUserId === currentUser?.id &&
            currentChat?.users.find((u) => u.userId === blockedUserId)
          ) {
            setBlocked({
              isBlocked: true,
              message: "You blocked this user",
            });
          }
        }
      },
    );

    socket.on(
      "userUnblocked",
      (payload: { unblockedUserId: number; unblockingUserId: number }) => {
        const { unblockedUserId, unblockingUserId } = payload;

        if (currentChat?.type === "direct") {
          if (
            unblockedUserId === currentUser?.id &&
            currentChat?.users.find((u) => u.userId === unblockingUserId)
          ) {
            setBlocked({
              isBlocked: false,
              message: "",
            });
          } else if (
            unblockingUserId === currentUser?.id &&
            currentChat?.users.find((u) => u.userId === unblockedUserId)
          ) {
            setBlocked({
              isBlocked: false,
              message: "",
            });
          }
        }
      },
    );
  }, [socket, currentChat, currentUser?.id]);

  return (
    <Form method="POST" onSubmit={handleSubmit}>
      <Input
        {...props}
        type="text"
        value={message}
        disabled={blocked.isBlocked}
        placeholder={blocked.isBlocked ? blocked.message : "Enter your message"}
        onChange={(e) => setMessage(e.target.value)}
      />
    </Form>
  );
}
