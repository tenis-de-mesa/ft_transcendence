import { useEffect, useState } from "react";
import { Card, Typography, UserWithStatus } from "../../components";
import { ChatMember, User } from "../../types";
import { socket } from "../../socket";

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
    socket.on("userAdded", (user: User) => {
      setUsers((users) => [...users, user]);
    });

    socket.on("userRemoved", (user: User) => {
      setUsers((users) => users.filter((u) => u.id !== user.id));
    });

    return () => {
      socket.off("userAdded");
      socket.off("userRemoved");
    };
  }, []);

  return (
    <Card className="w-1/3">
      <Card.Title>
        <Typography variant="h6">Members</Typography>
      </Card.Title>
      <Card.Body>
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <UserWithStatus key={user.id} user={user} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
