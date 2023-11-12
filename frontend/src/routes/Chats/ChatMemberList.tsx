import { Card, Typography } from "../../components";
import { ChatMember } from "../../types";

import ChatMemberItem from "./ChatMemberItem";

type ChatMemberListProps = {
  members: ChatMember[];
};

export default function ChatMemberList({ members }: ChatMemberListProps) {
  const users = members
    .filter((member) => !member.user.deletedAt)
    .map((member) => member.user);

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
