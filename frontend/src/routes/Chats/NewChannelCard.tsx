import { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Form } from "react-router-dom";
import { User } from "../../types";
import { AuthContext, ChatContext } from "../../contexts";
import { Button, Card, Hr, Input, Typography } from "../../components";

export default function NewChannelCard() {
  const { currentUser } = useContext(AuthContext);
  const { closeCard } = useContext(ChatContext);
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
    closeCard();
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

  return (
    <>
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
              onClick={closeCard}
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
