import { socket } from "../socket";
import { Form, Link, useLoaderData, useRouteLoaderData } from "react-router-dom";
import { Chat, Message, User } from "../types/types";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { AiFillCloseCircle } from "react-icons/ai";
import { LiaUserSlashSolid, LiaUserSolid } from "react-icons/lia";
import { Input } from "../components/Input";
import { blockUser, unblockUser } from "../actions/blockUser";
import classNames from "classnames";

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User>(null);

  const refMessages = useRef(null);

  let lastUser: User | null = null;

  const userMe = useRouteLoaderData("root") as User;

  const [chat, setChat] = useState(useLoaderData() as Chat);
  const [newMessage, setNewMessage] = useState("");
  const chatId = chat.id;

  const members = chat.users.map((user) => user.id)
  const isBlockedForOthers: boolean = chat.type == "direct"
    && userMe.blockedBy.find((user) => members.includes(user)) !== undefined;

  const isBlockedByMe = userMe.blockedUsers
    .find((user) => members.includes(user)) !== undefined

  const handleSubmitNewMessage = () => {
    setNewMessage("");
  };

  const checkUserIsBlocked = (userBlockedId: number) => {
    return userMe.blockedUsers.includes(userBlockedId);
  }

  useEffect(() => {
    const scrollHeight = refMessages.current.scrollHeight;
    const height = refMessages.current.clientHeight;
    const maxScrollTop = scrollHeight - height;
    refMessages.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
  });

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

  // Add event listener to close new channel dialog when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        isOpen &&
        !e.target.closest(".dialog") &&
        !e.target.closest(".new-channel-button")
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <Card className="w-full h-full">
      <Card.Title>
        <Typography variant="h6">Chat {chat.id}</Typography>
      </Card.Title>
      <Card.Body position="left" className="h-5/6">
        <div className="h-full">
          <div
            onClick={() => setIsOpen(false)}
            className={classNames(
              "fixed inset-0 max-h-screen z-[1000] bg-gray-900/50",
              {
                block: isOpen,
                hidden: !isOpen,
              },
            )}
          ></div>

          {isOpen && (
            <div className="absolute dialog z-[1001] w-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
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

                    {
                      userMe.id != user?.id && chat.type == "direct" && (
                        !checkUserIsBlocked(user?.id) ? (
                          <Button
                            IconOnly={<LiaUserSlashSolid />}
                            size="md"
                            variant="error"
                            onClick={() => {
                              setIsOpen(false);
                              blockUser(user?.id);
                            }}
                          />
                        ) : (
                          <Button
                            IconOnly={<LiaUserSolid />}
                            size="md"
                            variant="success"
                            onClick={() => {
                              setIsOpen(false);
                              unblockUser(user?.id);
                            }}
                          />
                        )
                      )
                    }

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

          <div
            ref={refMessages}
            className="h-full mb-4 overflow-scroll break-words no-scrollbar"
          >
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
            <Form method="POST" onSubmit={handleSubmitNewMessage}>
              <Input
                type="text"
                value={newMessage}
                name="message"
                placeholder={
                  isBlockedForOthers ? "You have been blocked" : isBlockedByMe
                    ? "You blocked this user" : "Enter your message"}
                onChange={(e) => setNewMessage(e.target.value)}
                {...((isBlockedForOthers || isBlockedByMe) && { disabled: true })}
              />
            </Form>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
