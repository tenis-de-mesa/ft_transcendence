import { useEffect, useState } from "react";
import { Chat, User } from "../types/types";
import "./Chat.css";

import { Form, Outlet, useLoaderData } from "react-router-dom";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { FiPlus, FiX } from "react-icons/fi";
import { RootUser } from "./Root";

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
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="chat">
      <div className="card">
        <center>
          <h3>Chats</h3>
        </center>
        <Button
          className="new-channel-button w-full my-2"
          LeadingIcon={<FiPlus />}
          variant="info"
          onClick={() => {
            setIsOpen(!isOpen);
          }}
        >
          New channel
        </Button>
        {isOpen && (
          <div className="dark fixed dialog">
            <Card>
              <Card.Title>
                <div className="flex items-center justify-between gap-5">
                  <Typography variant="md">
                    Select friends to chat with
                  </Typography>
                  <Button
                    IconOnly={<FiX />}
                    size="md"
                    variant="info"
                    onClick={() => setIsOpen(false)}
                  />
                </div>
              </Card.Title>
              <Card.Body>
                <div>
                  <input
                    type="text"
                    placeholder="Search users"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      color: "black",
                      paddingInline: ".25em",
                      width: "100%",
                      marginBottom: ".25em",
                    }}
                  />
                  <div className="h-[5.25em] overflow-y-auto">
                    <ul className="flex flex-col items-start">
                      {filteredUsers.map((user) => {
                        if (user.id === currentUser.id) return null;
                        return (
                          <li key={user.id}>
                            <label>
                              <input
                                className="mr-1"
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => toggleUserSelection(user.id)}
                              />
                              {user.nickname}
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </Card.Body>
              <Card.Footer>
                <Form
                  method="POST"
                  action="/channels"
                  onSubmit={handleNewChannelSubmit}
                >
                  {selectedUsers.map((userId) => (
                    <input type="hidden" name="users[]" value={userId} />
                  ))}
                  <input type="hidden" name="users[]" value={currentUser.id} />
                  <Button className="w-full" type="submit" variant="info">
                    Create Channel
                  </Button>
                </Form>
              </Card.Footer>
            </Card>
          </div>
        )}
        <hr />
        {chats.map((chat) => (
          <div key={chat.id}>
            <a href={`/chats/${chat.id}`}>
              [{chat.id}] - {chat.name}
            </a>
            <hr />
          </div>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
