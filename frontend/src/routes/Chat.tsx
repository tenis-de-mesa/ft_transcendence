import { socket } from "../socket";
import { Form, useLoaderData } from "react-router-dom";
import { Chat, Message } from "../types/types";
import { useEffect, useState } from "react";

export default function Chat() {
  const [chat, setChat] = useState(useLoaderData() as Chat);
  const [newMessage, setNewMessage] = useState("");
  const chatId = chat.id;

  const handleSubmitNewMessage = () => {
    setNewMessage("");
  };

  useEffect(() => {
    socket.on(`newMessage`, (data: Message) => {
      // If the message is not from the current chat, ignore it
      if (data.chat!.id != chatId) return;

      if (!chat.messages.find((message) => message.id == data.id)) {
        chat.messages.push(data);
        setChat({ ...chat });
      }
    });
  });

  return (
    <div className="card">
      <center>
        <h3>Chat {chat.id}</h3>
        <hr />
        <p>Messages:</p>
      </center>
      <ul>
        {chat.messages.map((message) => (
          <li key={message.id}>{message.content}</li>
        ))}
      </ul>
      <Form
        className="messageInput"
        method="POST"
        onSubmit={handleSubmitNewMessage}
      >
        <input
          type="text"
          name="message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" hidden>
          Send
        </button>
      </Form>
    </div>
  );
}
