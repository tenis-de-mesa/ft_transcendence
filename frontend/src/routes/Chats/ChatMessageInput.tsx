import { FormEvent, useState } from "react";
import { useFetcher, useParams } from "react-router-dom";
import { Input } from "../../components";
import { socket } from "../../socket";

type ChatMessageInputProps = {
  isBlocked: boolean;
};

export default function ChatMessageInput({ isBlocked }: ChatMessageInputProps) {
  const params = useParams();
  const { Form } = useFetcher();
  const [message, setMessage] = useState("");

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

  return (
    <Form method="POST" onSubmit={handleSubmit}>
      <Input
        type="text"
        value={message}
        placeholder="Enter your message"
        disabled={isBlocked}
        onChange={(e) => setMessage(e.target.value)}
      />
    </Form>
  );
}
