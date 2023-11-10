import { socket } from "../socket";
import { Form, Link, useLoaderData, useRevalidator } from "react-router-dom";
import { Chat, Message, User } from "../types/types";
import {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { LiaUserSlashSolid, LiaUserSolid } from "react-icons/lia";
import { Input } from "../components/Input";
import { FiX, FiLock, FiUnlock } from "react-icons/fi";
import { Hr } from "../components/Hr";
import { blockUser, unblockUser } from "../actions/blockUser";
import { Alert } from "../components/Alert";
import { AuthContext } from "../contexts";
import { makeRequest } from "../api";

function Overlay() {
  return <div className="fixed inset-0 z-[1000] bg-gray-900/50"></div>;
}

type ChatProfileCardProps = {
  user: User;
  handleClose: () => void;
};

function ChatProfileCard({ user, handleClose }: ChatProfileCardProps) {
  const { currentUser } = useContext(AuthContext);

  // TODO: Auto update blocked users to display proper buttons

  const checkUserIsBlocked = (userBlockedId: number) => {
    return currentUser.blockedUsers.includes(userBlockedId);
  };

  const handleUserBlock = () => {
    blockUser(user?.id);
  };

  const handleUserUnblock = () => {
    unblockUser(user?.id);
  };

  // Add event listener to close profile card when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#profile-card")) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleClose]);

  return (
    <>
      <Overlay />

      <Card
        id="profile-card"
        className="absolute z-[1001] w-1/3 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:bg-gray-900"
      >
        <Card.Title
          hr={!user.deletedAt}
          className="flex items-center justify-center"
        >
          <div className="flex flex-1 ">
            <Avatar size="sm" seed={user?.login} src={user?.avatarUrl} />
          </div>

          <Typography variant="h6">
            {!user.deletedAt ? (
              <Link to={`/profile/${user?.id}`}>{user?.nickname}</Link>
            ) : (
              "Deleted user"
            )}
          </Typography>

          <div className="flex gap-1 flex-1 justify-end">
            {!user.deletedAt &&
              currentUser.id !== user?.id &&
              (checkUserIsBlocked(user?.id) ? (
                <Button
                  size="md"
                  variant="success"
                  title="Unblock"
                  IconOnly={<LiaUserSolid />}
                  onClick={handleUserUnblock}
                />
              ) : (
                <Button
                  size="md"
                  variant="error"
                  title="Block"
                  IconOnly={<LiaUserSlashSolid />}
                  onClick={handleUserBlock}
                />
              ))}

            <Button
              IconOnly={<FiX />}
              size="md"
              variant="info"
              title="Close"
              onClick={handleClose}
            />
          </div>
        </Card.Title>
        {!user.deletedAt && (
          <Card.Body>
            <Typography variant="sm">
              <strong>Nickname:</strong> {user?.nickname}
            </Typography>
          </Card.Body>
        )}
      </Card>
    </>
  );
}

type AlertHiddenState = {
  status: "hidden";
};

type AlertErrorState = {
  status: "error";
  message: string;
};

type AlertSuccessState = {
  status: "success";
  message: string;
};

type AlertState = AlertHiddenState | AlertErrorState | AlertSuccessState;

type ChatChangePasswordCardProps = {
  chat: Chat;
  handleClose: () => void;
};

function ChatChangePasswordCard({
  chat,
  handleClose,
}: ChatChangePasswordCardProps) {
  // TODO: Remove
  const revalidator = useRevalidator();

  const [alert, setAlert] = useState<AlertState>({
    status: "hidden",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { currentPassword, newPassword, confirmPassword } = passwordForm;

  const disableChange =
    newPassword.length === 0 ||
    confirmPassword.length === 0 ||
    newPassword !== confirmPassword ||
    (currentPassword.length === 0 && chat.access === "protected");

  const disableRemove = currentPassword.length === 0;

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget;

    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });

    setAlert({
      status: "hidden",
    });
  };

  const handleSubmit = async (
    e: FormEvent<HTMLButtonElement>,
    body: string
  ) => {
    e.preventDefault();

    const { error } = await makeRequest(`/chats/${chat.id}/change-password`, {
      method: "POST",
      body,
    });

    if (error) {
      return setAlert({
        status: "error",
        message: error.message,
      });
    }

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setAlert({
      status: "success",
      message:
        currentPassword && newPassword && confirmPassword
          ? "Password changed successfully"
          : currentPassword
          ? "Password removed successfully"
          : "Password set successfully",
    });

    // TODO: Find better solution
    revalidator.revalidate();
  };

  const handleRemovePassword = async (e: FormEvent<HTMLButtonElement>) => {
    handleSubmit(
      e,
      JSON.stringify({
        currentPassword,
      })
    );
  };

  const handleChangePassword = async (e: FormEvent<HTMLButtonElement>) => {
    console.log("got here");
    handleSubmit(
      e,
      JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      })
    );
  };

  // Add event listener to close change password dialog when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#change-password-card")) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        setAlert({
          status: "hidden",
        });

        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleClose]);

  return (
    <>
      <Overlay />

      <Card
        id="change-password-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title className="flex items-center justify-between">
          <Typography variant="h6" customWeight="bold">
            Change channel password
          </Typography>
          <Button
            IconOnly={<FiX />}
            size="md"
            variant="info"
            onClick={handleClose}
          />
        </Card.Title>
        <Card.Body>
          <Form className="flex flex-col gap-3 text-left">
            {chat.access === "protected" && (
              <>
                <Input
                  label="Current password"
                  type="password"
                  name="currentPassword"
                  placeholder="Insert current password"
                  helperText="Must be filled to perform any changes to channel password"
                  value={currentPassword}
                  onChange={handleFormChange}
                />

                <Hr />
              </>
            )}

            <Input
              label="New password"
              type="password"
              name="newPassword"
              placeholder="Insert new password"
              value={newPassword}
              error={newPassword !== confirmPassword}
              onChange={handleFormChange}
            />

            <Input
              value={confirmPassword}
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              error={
                newPassword !== confirmPassword ? "Passwords must match" : false
              }
              onChange={handleFormChange}
            />

            <Button
              className="font-bold justify-center"
              variant="info"
              type="submit"
              disabled={disableChange}
              onClick={handleChangePassword}
            >
              Change password
            </Button>

            {chat.access === "protected" && (
              <>
                <Hr text="Or" />

                <Button
                  className="font-bold justify-center"
                  variant="error"
                  type="submit"
                  disabled={disableRemove}
                  onClick={handleRemovePassword}
                >
                  Remove password (make channel public)
                </Button>
              </>
            )}

            {alert.status !== "hidden" && (
              <Alert
                className="w-full"
                severity={alert.status}
                variant="filled"
              >
                {alert.message}
              </Alert>
            )}
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}

type ChatMessagesProps = {
  chat: Chat;
  handleClick: (user: User) => void;
};

function ChatMessages({ chat, handleClick }: ChatMessagesProps) {
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

export default function Chat() {
  const revalidator = useRevalidator();
  const chat = useLoaderData() as Chat;
  const { currentUser } = useContext(AuthContext);
  const [isProfileCardOpen, setIsProfileCardOpen] = useState(false);
  const [isChangePassCardOpen, setIsChangePassCardOpen] = useState(false);
  const [user, setUser] = useState<User>(null);
  const [userRole, setUserRole] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const isAdmin = userRole === "owner" || userRole === "admin";
  const chatId = chat.id;
  const members = chat.users.map((user) => user.id);

  const isBlockedForOthers =
    chat.type === "direct" &&
    currentUser.blockedBy.find((user) => members.includes(user)) !== undefined;

  const isBlockedByMe =
    currentUser.blockedUsers.find((user) => members.includes(user)) !==
    undefined;

  useEffect(() => {
    const fetchChannelRole = async (chatId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3001/chats/${chatId}/role`,
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

  useEffect(() => {
    socket.on(`newMessage`, (data: Message) => {
      // If the message is not from the current chat, ignore it
      if (data.chat!.id != chatId) return;

      if (!chat.messages.find((message) => message.id == data.id)) {
        chat.messages.push(data);
        revalidator.revalidate();
      }
    });
  }, [chat.messages, chatId, revalidator]);

  return (
    <Card className="w-full h-full">
      <Card.Title
        hr={false}
        className="flex justify-between items-center min-h-[60px] shadow-[0px_10px_5px_-5px] shadow-gray-900/50"
      >
        {/* TODO: Make it so button does not dislocate chat name */}
        <Typography className="flex-1" variant="h6">
          Chat {chat.id}
        </Typography>
        {isAdmin && chat.access !== "private" && (
          <Button
            IconOnly={chat.access === "public" ? <FiUnlock /> : <FiLock />}
            size="sm"
            variant="info"
            onClick={() => setIsChangePassCardOpen(!isChangePassCardOpen)}
            className=""
          ></Button>
        )}
      </Card.Title>
      <Card.Body position="left" className="pt-0 h-5/6">
        {isProfileCardOpen && (
          <ChatProfileCard
            user={user}
            handleClose={() => setIsProfileCardOpen(false)}
          />
        )}

        {isChangePassCardOpen && (
          <ChatChangePasswordCard
            chat={chat}
            handleClose={() => setIsChangePassCardOpen(false)}
          />
        )}

        <ChatMessages
          chat={chat}
          handleClick={(user) => {
            setUser(user);
            setIsProfileCardOpen(true);
          }}
        />

        <Form method="POST" onSubmit={() => setNewMessage("")}>
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
            disabled={isBlockedForOthers || isBlockedByMe}
          />
        </Form>
      </Card.Body>
    </Card>
  );
}
