import { FormEvent, useContext, useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { Input } from "../../components";
import { AuthContext, ChatContext } from "../../contexts";

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
    const newMessage = message.trim();

    setMessage("");
    if (!newMessage.length) {
      return e.preventDefault();
    }
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

  return (
    <Form method="POST" onSubmit={handleSubmit}>
      <Input
        {...props}
        type="text"
        name="message"
        value={message}
        disabled={blocked.isBlocked}
        placeholder={blocked.isBlocked ? blocked.message : "Enter your message"}
        onChange={(e) => setMessage(e.target.value)}
      />
    </Form>
  );
}
