import { FormEvent, useState } from "react";
import { useFetcher, useParams } from "react-router-dom";
import { Input } from "../../components";
import { socket } from "../../socket";

interface ChatMessageInputProps
  extends React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  > {}

export default function ChatMessageInput({ ...props }: ChatMessageInputProps) {
  const params = useParams();
  // TODO: retrieve errors from action
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
        {...props}
        type="text"
        value={message}
        placeholder="Enter your message"
        onChange={(e) => setMessage(e.target.value)}
      />
    </Form>
  );
}
