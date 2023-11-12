import { Card, Typography } from "../../components";
import { ChatMember } from "../../types";

import ChatMemberItem from "./ChatMemberItem";

type ChatMemberListProps = {
  members: ChatMember[];
};

export default function ChatMemberList({ members }: ChatMemberListProps) {
  return (
    <Card className="w-1/4">
      <Card.Title>
        <Typography variant="h6">Members - {members.length}</Typography>
      </Card.Title>
      <Card.Body>
        <div className="flex flex-col gap-2">
          {members.map((member) => (
            <ChatMemberItem key={member.userId} user={member.user} />
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}
