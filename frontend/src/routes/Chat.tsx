import { socket } from "../socket";
import { Form, Link, useLoaderData } from "react-router-dom";
import { Chat, Message, User } from "../types/types";
import { useEffect, useState } from "react";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { AiFillCloseCircle } from "react-icons/ai";
import { Input } from "../components/Input";

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
    <div className="w-full h-full mr-5">
      <Card className="h-full overflow-y-scroll no-scrollbar">
        <Card.Title>
          <Typography variant="h6">Chat {chat.id}</Typography>
        </Card.Title>
        <Card.Body position="left">
          <div className="grid justify-between grid-flow-row grid-cols-1 gap-4">
            {isOpen && (
              <div className="absolute w-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <Card className="dark:bg-gray-900">
                  <Card.Title>
                    <div className="flex items-center justify-between">
                      <Avatar 
                        size="sm"
                        seed={user?.login} 
                        src={user?.avatarUrl}
                      />
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
                          <Typography variant="sm">
                            <strong>Nickname:</strong> {user?.nickname}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}

            <div className="">
              {chat.messages.map((message) => {
                const showAvatar = lastUser?.id != message.sender?.id;
                lastUser = message.sender;
                return (
                  <div key={message.id}>
                    {showAvatar && (
                      <div className="flex gap-4 mt-5">
                        <Avatar
                          seed={message.sender.login}
                          src={message.sender.avatarUrl}
                          size="sm"
                        />
                        <div
                          onClick={() => {
                            setIsOpen(!isOpen);
                            setUser(message.sender);
                          }}
                          className="cursor-pointer"
                        >
                          <Typography variant="h6">
                            {message.sender?.nickname}
                          </Typography>
                        </div>
                      </div>
                    )}
                    <Typography variant="sm" className="ml-14">
                      {message.content}
                    </Typography>
                  </div>
                );
              })}
            </div>

            <div className="">
              <Form
                method="POST"
                onSubmit={handleSubmitNewMessage}
              >
                <Input 
                  type="text"
                  value={newMessage}
                  name="message"
                  placeholder="Enter your message"
                  onChange={(e) => setNewMessage(e.target.value)}
                />
              </Form>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
