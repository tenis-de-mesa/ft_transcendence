import { Chat, User } from "../types/types";
import { Form, Link, Outlet, useLoaderData } from "react-router-dom";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { useContext, useEffect, useState } from "react";
import { FiPlus, FiX } from "react-icons/fi";
import { Input } from "../components/Input";
import { Hr } from "../components/Hr";
import { AuthContext } from "../contexts";

export default function Chats() {
  const chats: Chat[] = useLoaderData() as Chat[];

  return (
    <div className="flex flex-row justify-between h-full gap-3">
      <div className="w-1/4">
        <Card className="h-full">
          <Card.Title>
            <Typography variant="h6">Chats</Typography>
          </Card.Title>
          <Card.Body className="h-full pt-0">
            <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
              <div className="flex flex-col gap-2 text-left">
                {chats.map((chat) => (
                  <Link
                    key={chat.id}
                    to={`/chats/${chat.id}`}
                    state={{ id: chat.id }}
                  >
                    <Typography variant="sm">{chat.name}</Typography>
                  </Link>
                ))}
              </div>

              <NewChannelButton />
            </div>
          </Card.Body>
        </Card>
      </div>

      <div className="w-3/4 h-full">
        <Outlet />
      </div>
    </div>
  );
}

function NewChannelButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        className="flex items-center justify-center w-full"
        LeadingIcon={<FiPlus />}
        variant="info"
        onClick={() => setIsOpen(!isOpen)}
      >
        New channel
      </Button>

      {isOpen && <NewChannelCard onClose={() => setIsOpen(false)} />}
    </>
  );
}

function Overlay() {
  return <div className="fixed inset-0 z-[1000] bg-gray-900/50"></div>;
}

function NewChannelCard({ onClose }) {
  const { currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsersId, setSelectedUsersId] = useState<number[]>([]);

  // Function to toggle user selection
  const toggleUserSelection = (userId: number) => {
    if (selectedUsersId.includes(userId)) {
      setSelectedUsersId(selectedUsersId.filter((id) => id !== userId));
    } else {
      setSelectedUsersId([...selectedUsersId, userId]);
    }
  };

  // Close dialog, clear search and selected users on submit
  const handleNewChannelSubmit = () => {
    onClose();
    setSearchTerm("");
    setSelectedUsersId([]);
    setHasPassword(false);
    setPassword("");
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetch(`http://localhost:3001/users/`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
      });
  }, []);

  // When search term changes, filter users
  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, users]);

  // Add event listener to close create channel card when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest("#create-channel-card")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  return (
    <>
      <Overlay />

      <Card
        id="create-channel-card"
        className="absolute z-[1001] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[calc(100%-4rem)] max-w-[30rem] dark:bg-gray-900"
      >
        <Card.Title hr={false}>
          <div className="flex items-center justify-between gap-5">
            <Typography variant="h6" customWeight="bold" className="text-left">
              Select friends to chat with
            </Typography>
            <Button
              variant="info"
              size="sm"
              IconOnly={<FiX />}
              onClick={onClose}
            />
          </div>
        </Card.Title>
        <Card.Body>
          <Form
            method="POST"
            action="/channels"
            onSubmit={handleNewChannelSubmit}
          >
            <Input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="my-3 overflow-y-auto min-h-[15rem]">
              {filteredUsers.length > 1 ? (
                <ul className="flex flex-col items-start">
                  {filteredUsers.map((user) => {
                    if (user.id === currentUser.id) return null;

                    return (
                      <li key={user.id}>
                        <input
                          className="mr-1"
                          type="checkbox"
                          value={user.id}
                          name="users[]"
                          checked={selectedUsersId.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                        />
                        <Typography variant="md" as="label">
                          {user.nickname}
                        </Typography>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Typography variant="md" customColor="text-gray-500">
                  No friends found :(
                </Typography>
              )}
            </div>

            <Hr className="my-3"></Hr>

            <div className="text-left">
              <input
                type="checkbox"
                name="hasPassword"
                id="hasPassword"
                className="mr-1 mb-3"
                onChange={() => setHasPassword(!hasPassword)}
              />
              <Typography variant="md" as="label">
                Protect with password
              </Typography>
            </div>

            {hasPassword && (
              <div className="mb-3">
                <Input
                  name="password"
                  type="password"
                  placeholder="Insert password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                ></Input>
              </div>
            )}

            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="info"
              disabled={hasPassword && password.length === 0}
            >
              Create Channel
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
}
