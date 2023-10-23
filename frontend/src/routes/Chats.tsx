import { useEffect, useState } from "react";
import { Chat, User } from "../types/types";

import { Form, Outlet, useLoaderData } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { FiPlus, FiX } from "react-icons/fi";
import { RootUser } from "./Root";
import { Input } from "../components/Input";
import classNames from "classnames";

export default function Chats() {
  const currentUser = RootUser();
  const [chats, users] = useLoaderData() as [Chat[], User[]];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to toggle user selection
  const toggleUserSelection = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  // Function to filter users based on search term
  const filteredUsers: User[] = users.filter((user) =>
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Close dialog, clear search and selected users on submit
  const handleNewChannelSubmit = () => {
    setIsOpen(false);
    setSearchTerm("");
    setSelectedUsers([]);
  };

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
    <div className="flex flex-row justify-between h-full gap-3">
      <div
        onClick={() => setIsOpen(false)}
        className={classNames(
          "fixed inset-0 max-h-screen z-[1000] bg-gray-900/50",
          {
            block: isOpen,
            hidden: !isOpen,
          },
        )}
      >
      </div>

      <div className="w-1/4">
        <Card className="h-full">
          <Card.Title>
            <Typography variant="h6">Chats</Typography>
          </Card.Title>
          <Card.Body className="h-full pt-0">
            <div className="flex flex-col justify-between h-[calc(100%-4rem)]">
              {isOpen && (
                <div className="absolute z-[1001] transform -translate-x-1/2 -translate-y-1/2 dialog top-1/2 left-1/2">
                  <Card className="dark:bg-gray-900">
                    <Card.Title>
                      <div className="flex items-center justify-between gap-5">
                        <Typography variant="md">
                          Select friends to chat with
                        </Typography>
                        <Button
                          IconOnly={<FiX />}
                          size="sm"
                          variant="info"
                          onClick={() => setIsOpen(false)}
                        />
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
                                    onChange={() =>
                                      toggleUserSelection(user.id)
                                    }
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
                          <input
                            type="hidden"
                            name="users[]"
                            value={currentUser.id}
                          />
                          <Button
                            className="justify-center w-full"
                            type="submit"
                            variant="info"
                          >
                            Create Channel
                          </Button>
                        </Form>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              )}

              <div>
                {chats.map((chat) => (
                  <div key={chat.id} className="mt-2 text-left">
                    <a href={`/chats/${chat.id}`}>
                      <Typography variant="sm">
                        [{chat.id}] - {chat.name}
                      </Typography>
                    </a>
                  </div>
                ))}
              </div>

              <div>
                <Button
                  className="flex items-center justify-center w-full"
                  LeadingIcon={<FiPlus />}
                  variant="info"
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                >
                  New channel
                </Button>
              </div>
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
