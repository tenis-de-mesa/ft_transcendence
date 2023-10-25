import { socket } from "../socket";
import {
  Form,
  Link,
  useLoaderData,
  useRouteLoaderData,
  useRevalidator,
} from "react-router-dom";
import { Chat, Message, User } from "../types/types";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { LiaUserSlashSolid, LiaUserSolid } from "react-icons/lia";
import { Input } from "../components/Input";
import { FiX, FiLock, FiUnlock } from "react-icons/fi";
import { Hr } from "../components/Hr";
import { blockUser, unblockUser } from "../actions/blockUser";
import classNames from "classnames";

export default function Chat() {
  const revalidator = useRevalidator();
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isChangePassCardOpen, setIsChangePassCardOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [user, setUser] = useState<User>(null);

  const refMessages = useRef(null);

  let lastUser: User | null = null;

  const userMe = useRouteLoaderData("root") as User;

  const chat = useLoaderData() as Chat;
  const [userRole, setUserRole] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const isAdmin = userRole === "owner" || userRole === "admin";
  const chatId = chat.id;

  const members = chat.users.map((user) => user.id);
  const isBlockedForOthers: boolean =
    chat.type === "direct" &&
    userMe.blockedBy.find((user) => members.includes(user)) !== undefined;

  const isBlockedByMe =
    userMe.blockedUsers.find((user) => members.includes(user)) !== undefined;

  const handleSubmitNewMessage = () => {
    setNewMessage("");
  };

  const checkUserIsBlocked = (userBlockedId: number) => {
    return userMe.blockedUsers.includes(userBlockedId);
  };

  const handleSubmitChangePassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangePassCardOpen(false);
  };

  useEffect(() => {
    const fetchChannelRole = async (chatId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3001/chats/role/${chatId}`,
          {
            credentials: "include",
          }
        );
        const data = await response.json();
        setUserRole(data.role);
      } catch (error) {
        console.error("Error fetching channel role: ", error);
      }
    };

    fetchChannelRole(chatId).catch((error) =>
      console.error("Error setting channel role:", error)
    );
  }, [chatId]);

  // Add event listener to close change password dialog when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (isChangePassCardOpen && !e.target.closest("#change-password-card")) {
        handleSubmitChangePassword();
      }
    };

    if (isChangePassCardOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isChangePassCardOpen, handleSubmitChangePassword]);

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
        revalidator.revalidate();
      }
    });
  });

  // Add event listener to close profile card when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: any) => {
      if (isProfileCardOpen && !e.target.closest("#profile-card")) {
        setIsProfileCardOpen(false);
      }
    };

    if (isProfileCardOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    } else {
      document.removeEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isProfileCardOpen, setIsProfileCardOpen]);

  return (
    <Card className="w-full h-full">
      <Card.Title>
        <div className="flex justify-between items-center">
          <Typography className="flex-1" variant="h6">
            Chat {chat.id}
          </Typography>
          {isAdmin && chat.access !== "private" && (
            <Button
              IconOnly={chat.access === "public" ? <FiUnlock /> : <FiLock />}
              size="md"
              variant="info"
              onClick={() => setIsChangePassCardOpen(!isChangePassCardOpen)}
            ></Button>
          )}
        </div>
      </Card.Title>
      <Card.Body position="left" className="h-5/6">
        <div className="h-full">
          <div
            onClick={() => setIsProfileCardOpen(false)}
            className={classNames(
              "fixed inset-0 max-h-screen z-[1000] bg-gray-900/50",
              {
                block: isProfileCardOpen,
                hidden: !isProfileCardOpen,
              }
            )}
          ></div>

          {isProfileCardOpen && (
            <div
              id="profile-card"
              className="absolute z-[1001] w-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
            >
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

                    {userMe.id != user?.id &&
                      chat.type == "direct" &&
                      (!checkUserIsBlocked(user?.id) ? (
                        <Button
                          IconOnly={<LiaUserSlashSolid />}
                          size="md"
                          variant="error"
                          onClick={() => {
                            setIsProfileCardOpen(false);
                            blockUser(user?.id);
                          }}
                        />
                      ) : (
                        <Button
                          IconOnly={<LiaUserSolid />}
                          size="md"
                          variant="success"
                          onClick={() => {
                            setIsProfileCardOpen(false);
                            unblockUser(user?.id);
                          }}
                        />
                      ))}

                    <Button
                      IconOnly={<FiX />}
                      size="md"
                      variant="info"
                      onClick={() => setIsProfileCardOpen(false)}
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

          {isChangePassCardOpen && (
            <>
              <div
                className="overlay fixed top-0 left-0 w-full h-full z-999"
                style={{ background: "rgba(0, 0, 0, .65)" }} // TODO: Tailwind
              ></div>
              <div
                id="change-password-card"
                className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2"
              >
                <Card className="dark:bg-gray-900">
                  <Card.Title>
                    <div className="flex items-center justify-between gap-10">
                      <Typography variant="h6">
                        Change channel password
                      </Typography>
                      <Button
                        IconOnly={<FiX />}
                        size="md"
                        variant="info"
                        onClick={() => {
                          setIsChangePassCardOpen(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                        }}
                      />
                    </div>
                  </Card.Title>
                  <Card.Body>
                    <>
                      <Form
                        className="flex flex-col gap-3 text-left"
                        method="POST"
                        action={`/chats/${chatId}/change-password`}
                        onSubmit={handleSubmitChangePassword}
                      >
                        {chat.access === "protected" && (
                          <>
                            <input
                              type="hidden"
                              name="access"
                              value={chat.access}
                            />
                            <Input
                              label="Current password"
                              value={currentPassword}
                              type="password"
                              name="currentPassword"
                              placeholder="Insert current password"
                              helperText="Must be filled to perform any changes to channel password"
                              onChange={(e) =>
                                setCurrentPassword(e.target.value)
                              }
                            />
                            <Hr></Hr>
                          </>
                        )}
                        <Input
                          label="New password"
                          value={newPassword}
                          type="password"
                          name="newPassword"
                          placeholder="Insert new password"
                          error={
                            newPassword !== confirmPassword ? true : false
                          }
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <Input
                          value={confirmPassword}
                          type="password"
                          name="confirmPassword"
                          placeholder="Confirm new password"
                          error={
                            newPassword !== confirmPassword
                              ? "Passwords must match"
                              : false
                          }
                          onChange={(e) =>
                            setConfirmPassword(e.target.value)
                          }
                        />
                        <Button
                          className="w-full justify-center"
                          type="submit"
                          variant="info"
                          size="md"
                          disabled={
                            newPassword.length === 0 ||
                            confirmPassword.length === 0 ||
                            newPassword !== confirmPassword ||
                            (currentPassword.length === 0 &&
                              chat.access === "protected")
                          }
                        >
                          Change password
                        </Button>
                      </Form>
                      {chat.access === "protected" && (
                        <>
                          <Typography className="my-3" variant="md">
                            Or
                          </Typography>
                          <Form
                            method="POST"
                            action={`/chats/${chatId}/change-password`}
                            onSubmit={handleSubmitChangePassword}
                          >
                            <input
                              type="hidden"
                              name="currentPassword"
                              value={currentPassword}
                            />
                            <input
                              type="hidden"
                              name="access"
                              value={chat.access}
                            />
                            <Button
                              className="w-full font-bold justify-center"
                              type="submit"
                              variant="error"
                              size="md"
                              disabled={currentPassword.length === 0}
                            >
                              Remove password (make channel public)
                            </Button>
                          </Form>
                        </>
                      )}
                    </>
                  </Card.Body>
                </Card>
              </div>
            </>
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
                        seed={message.sender?.login}
                        src={message.sender?.avatarUrl}
                        size="sm"
                      />
                      <div
                        onClick={() => {
                          setIsProfileCardOpen(!isProfileCardOpen);
                          setUser(message.sender);
                        }}
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
            })}
          </div>

          <div className="">
            <Form method="POST" onSubmit={handleSubmitNewMessage}>
              <Input
                type="text"
                value={newMessage}
                name="message"
                placeholder={
                  isBlockedForOthers
                    ? "You have been blocked"
                    : isBlockedByMe
                    ? "You blocked this user"
                    : "Enter your message"
                }
                onChange={(e) => setNewMessage(e.target.value)}
                {...((isBlockedForOthers || isBlockedByMe) && {
                  disabled: true,
                })}
              />
            </Form>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
