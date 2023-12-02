import { useContext, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { Form } from "react-router-dom";
import { ChatAccess, User } from "../../types";
import { AuthContext, ChatContext } from "../../contexts";
import { Avatar, Button, Card, Input, Typography } from "../../components";

export default function NewChannelCard() {
  const { currentUser } = useContext(AuthContext);
  const { closeCard } = useContext(ChatContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAccess, setSelectedAccess] = useState<ChatAccess>("public");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUsersId, setSelectedUsersId] = useState<number[]>([]);

  const getAccessBoxStyle = (access: ChatAccess) => {
    return `bg-gray-700 px-2 py-1 rounded select-none flex-1 cursor-pointer
    ${access === selectedAccess ? "bg-info-700" : "bg-gray-700"}`;
  };

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
    // setSelectedAccess("public");
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
      <Form method="POST" action="/channels" onSubmit={handleNewChannelSubmit}>
        <Card
          id="create-channel-card"
          className="fixed z-[1001] transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 w-[calc(100%-4rem)] max-w-[30rem] dark:bg-gray-900"
        >
          <Card.Title
            hr={false}
            className="flex items-center justify-between gap-5"
          >
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
              onClick={closeCard}
            />
          </Card.Title>
          <Card.Body className="space-y-2">
            <Typography variant="md" className="text-left">
              Select participants
            </Typography>

            <Input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="my-3 overflow-y-auto h-[14rem] ">
              {filteredUsers.length >= 1 ? (
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
                            name="userId"
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
          </Card.Body>
          <Card.Footer position="left" className="space-y-3">
            <div className="text-white space-y-1">
              <Typography
                variant="xs"
                customColor="text-gray-400"
                className="text-left select-none"
              >
                CHAT ACCESS
              </Typography>

              <ul className="flex justify-between gap-2 text-center">
                <li
                  className={getAccessBoxStyle("public")}
                  onClick={() => setSelectedAccess("public")}
                >
                  <Typography variant="sm">PUBLIC</Typography>
                </li>
                <li
                  className={getAccessBoxStyle("protected")}
                  onClick={() => setSelectedAccess("protected")}
                >
                  <Typography variant="sm">PROTECTED</Typography>
                </li>
                <li
                  className={getAccessBoxStyle("private")}
                  onClick={() => setSelectedAccess("private")}
                >
                  <Typography variant="sm">PRIVATE</Typography>
                </li>
              </ul>
            </div>

            {selectedAccess === "protected" && (
              <Input
                name="password"
                type="password"
                placeholder="Insert password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            )}

            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="info"
              name="access"
              value={selectedAccess}
              disabled={selectedAccess === "protected" && password.length === 0}
            >
              Create Channel
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </>
  );
}
