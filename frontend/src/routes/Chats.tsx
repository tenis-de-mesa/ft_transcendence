import { Chat, User } from "../types/types";
import { Form, Link, Outlet, useLoaderData } from "react-router-dom";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { useContext, useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
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
            <>
              <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
                <div>
                  {chats.map((chat) => (
                    <div key={chat.id} className="mt-2 text-left">
                      <Link to={`/chats/${chat.id}`}>
                        <Typography variant="sm">{chat.name}</Typography>
                      </Link>
                    </div>
                  ))}
                </div>
                <NewChannelButton />
              </div>
            </>
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
  const [isNewChannelCardOpen, setIsNewChannelCardOpen] = useState(false);

  return (
    <>
      <Button
        className="flex items-center justify-center w-full"
        LeadingIcon={<FiPlus />}
        variant="info"
        onClick={() => setIsNewChannelCardOpen(!isNewChannelCardOpen)}
      >
        New channel
      </Button>
      {isNewChannelCardOpen && (
        <NewChannelCard onClose={() => setIsNewChannelCardOpen(false)} />
      )}
    </>
  );
}

function NewChannelCard({ onClose }) {
  const { currentUser } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

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

  // Function to toggle user selection
  const toggleUserSelection = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

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

  // Close dialog, clear search and selected users on submit
  const handleNewChannelSubmit = () => {
    onClose();
    setSearchTerm("");
    setSelectedUsers([]);
    setHasPassword(false);
    setPassword("");
  };

  return (
    <>
      <div className="fixed inset-0 z-[1000] bg-gray-900/50"></div>
      <div
        id="create-channel-card"
        className="absolute z-[1001] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"
      >
        <Card className="dark:bg-gray-900">
          <Card.Title>
            <div className="flex items-center justify-between gap-5">
              <Typography variant="md">Select friends to chat with</Typography>
            </div>
          </Card.Title>
          <Card.Body>
            <div>
              <Input
                type="text"
                placeholder="Search users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <div className="my-3 overflow-y-auto">
                <ul className="flex flex-col items-start">
                  {filteredUsers.map((user) => {
                    if (user.id === currentUser.id) return null;
                    return (
                      <li key={user.id}>
                        <input
                          className="mr-1"
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                        />
                        <Typography variant="sm" as="label">
                          {user.nickname}
                        </Typography>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Form
                method="POST"
                action="/channels"
                onSubmit={handleNewChannelSubmit}
              >
                {selectedUsers.map((userId, index) => (
                  <input
                    type="hidden"
                    name="users[]"
                    value={userId}
                    key={index}
                  />
                ))}
                <input type="hidden" name="users[]" value={currentUser.id} />

                <Hr className="my-3"></Hr>

                <div className="text-left">
                  <input
                    type="checkbox"
                    name="hasPassword"
                    id="hasPassword"
                    className="mr-1 mb-3"
                    onChange={() => setHasPassword(!hasPassword)}
                  />
                  <Typography variant="sm" as="label">
                    Protect with password
                  </Typography>
                </div>

                {hasPassword && (
                  <div className="mb-3">
                    <Input
                      type="password"
                      placeholder="Insert password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    ></Input>
                  </div>
                )}

                {hasPassword && (
                  <input type="hidden" name="password" value={password} />
                )}

                <Button
                  className="justify-center w-full"
                  type="submit"
                  variant="info"
                  disabled={hasPassword && password.length === 0}
                >
                  Create Channel
                </Button>
              </Form>
            </div>
          </Card.Body>
        </Card>
      </div>
    </>
  );
}
