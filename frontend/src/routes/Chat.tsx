import { socket } from "../socket";
import { Form, Link, useLoaderData } from "react-router-dom";
import { Chat, Message, User } from "../types/types";
import { useEffect, useState } from "react";
import Avatar from "../components/Avatar";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { AiFillCloseCircle } from "react-icons/ai";

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User>(null);

  let lastUser: User | null = null;

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
      {isOpen && (
        <div className="dark fixed w-1/2">
          <Card>
            <Card.Title>
              <div className="flex items-center justify-between">
                <Avatar login={user?.login} avatarUrl={user?.avatarUrl} />
                <Typography variant="h6">
                  <Link to={`/profile/${user?.id}`}>{user?.nickname}</Link>
                </Typography>
                <Button
                  IconOnly={<AiFillCloseCircle />}
                  size="md"
                  variant="info"
                  onClick={() => setIsOpen(false)}
                />
              </div>
            </Card.Title>
            <Card.Body>
              <div className="flip-card">
                <div className="wrapper">
                  <div className="card front">
                    <p>
                      <strong>Nickname:</strong> {user?.nickname}
                    </p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
      <div className="messages">
        {chat.messages.map((message) => {
          const showAvatar = lastUser?.id != message.user?.id;

          lastUser = message.user;

          return (
            <div key={message.id}>
              {showAvatar && (
                <div className="flex gap-4">
                  <Avatar
                    login={message.user?.login}
                    avatarUrl={message.user?.avatarUrl}
                  />
                  <button
                    onClick={() => {
                      setIsOpen(!isOpen);
                      setUser(message.user);
                    }}
                  >
                    <Typography variant="h6">
                      {message.user?.nickname}:
                    </Typography>
                  </button>
                </div>
              )}
              <div className="pl-16">{message.content}</div>
            </div>
          );
        })}
      </div>
      <Form
        className="messageInput"
        method="POST"
        onSubmit={handleSubmitNewMessage}
      >
        <input
          type="text"
          name="message"
          value={newMessage}
          className="bg-gray-500"
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" hidden>
          Send
        </button>
      </Form>
    </div>
  );
}
