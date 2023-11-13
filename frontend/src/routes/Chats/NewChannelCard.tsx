import { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Form } from "react-router-dom";
import { User } from "../../types";
import { AuthContext } from "../../contexts";
import {
  Avatar,
  Button,
  Card,
  Input,
  Overlay,
  Typography,
} from "../../components";

export default function NewChannelCard({ onClose }) {
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
        user.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
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

      <Form method="POST" action="/channels" onSubmit={handleNewChannelSubmit}>
        <Card
          id="create-channel-card"
          className="fixed z-[1001] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[calc(100%-4rem)] max-w-[30rem] dark:bg-gray-900"
        >
          <Card.Title>
            <Typography
              variant="h6"
              customWeight="bold"
              className="text-center"
            >
              New channel
            </Typography>
            <Button
              variant="info"
              size="sm"
              IconOnly={<FiX />}
              onClick={onClose}
              className="absolute top-0 right-0 m-3"
            />
          </Card.Title>
          <Card.Body position="left">
            <Typography variant="lg" className="text-left">
              Select participants
            </Typography>

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
                      <li key={user.id} className="w-full">
                        <Typography
                          variant="md"
                          as="label"
                          customWeight={
                            selectedUsersId.includes(user.id)
                              ? "bold"
                              : "regular"
                          }
                        >
                          <input
                            className="mr-1 hidden"
                            type="checkbox"
                            value={user.id}
                            name="users[]"
                            checked={selectedUsersId.includes(user.id)}
                            onChange={() => toggleUserSelection(user.id)}
                          />
                          <div className={`flex items-center m-1`}>
                            <Avatar
                              className="mr-2"
                              seed={user.login}
                              size="sm"
                              src={user.avatarUrl}
                            />
                            {user.nickname}
                            {selectedUsersId.includes(user.id) && (
                              <span className="text-green-500 m-2">✓</span>
                            )}
                          </div>
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

            <Typography variant="md" as="label">
              <input
                type="checkbox"
                name="hasPassword"
                id="hasPassword"
                className="mr-1 mb-3"
                onChange={() => setHasPassword(!hasPassword)}
              />
              Protect with password
            </Typography>

            {hasPassword && (
              <div className="mb-3">
                <Input
                  name="password"
                  type="password"
                  placeholder="Insert password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                ></Input>
              </div>
            )}
          </Card.Body>
          <Card.Footer>
            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="info"
              disabled={hasPassword && password.length === 0}
            >
              Create Channel
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </>
  );
}
