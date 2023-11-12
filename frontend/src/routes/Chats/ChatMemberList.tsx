import { useEffect, useState } from "react";
import { Card, Typography } from "../../components";
import { ChatMember, User } from "../../types";
import { socket } from "../../socket";

import ChatMemberItem from "./ChatMemberItem";

type ChatMemberListProps = {
  members: ChatMember[];
};

export default function ChatMemberList({ members }: ChatMemberListProps) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const nonDeletedUsers = members
      .filter((member) => !member.user.deletedAt)
      .map((member) => member.user);

    setUsers(nonDeletedUsers);
  }, [members]);

  useEffect(() => {
    socket.on("userJoined", (user: User) => {
      setUsers((users) => [...users, user]);
    });

    socket.on("userLeft", (user: User) => {
      setUsers((users) => users.filter((u) => u.id !== user.id));
    });

    return () => {
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, []);

  return (
    <Card className="w-1/4">
      <Card.Title>
        <Typography variant="h6">Members - {users.length}</Typography>
      </Card.Title>
      <Card.Body>
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <ChatMemberItem key={user.id} user={user} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
