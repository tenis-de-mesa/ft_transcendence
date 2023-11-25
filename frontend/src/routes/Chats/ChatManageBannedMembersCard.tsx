import { useContext, useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { makeRequest } from "../../api";
import { ChatMember } from "../../types";
import { ChatContext } from "../../contexts";
import { Button, Card, Typography } from "../../components";

import ChatMemberItem from "./ChatMemberItem";
import { socket } from "../../socket";

type ChatManageBannedMembersCardProps = {
  onBack: () => void;
};

export default function ChatManageBannedMembersCard({
  onBack,
}: ChatManageBannedMembersCardProps) {
  const { currentChat } = useContext(ChatContext);
  const [bannedMembers, setBannedMembers] = useState<ChatMember[]>([]);
  const { Form } = useFetcher();

  useEffect(() => {
    const fetchBannedMembers = async () => {
      const { data, error } = await makeRequest<ChatMember[]>(
        `/chats/${currentChat?.id}/members/banned`,
        { method: "GET" },
      );

      if (error) {
        console.error(error);
      }

      setBannedMembers(data as ChatMember[]);
    };

    fetchBannedMembers();
  }, [currentChat?.id]);

  useEffect(() => {
    socket.on("userUnbanned", (unbanUserId: number) => {
      setBannedMembers((prev) =>
        prev.filter((member) => member?.userId !== unbanUserId),
      );
    });
  }, []);

  return (
    <Card
      id="change-password-card"
      className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
    >
      <Card.Title className="flex items-center justify-between">
        <Typography variant="h6">Banned members</Typography>
        <Button
          IconOnly={<FiChevronLeft />}
          size="md"
          variant="info"
          onClick={onBack}
        />
      </Card.Title>
      <Card.Body>
        {bannedMembers.length > 0 ? (
          <>
            {bannedMembers.map((member: ChatMember) => (
              <div
                key={member?.userId}
                className="flex justify-between items-center gap-2"
              >
                <ChatMemberItem user={member?.user} />
                <Form action={`${currentChat?.id}/unban`} method="POST">
                  <Button
                    title={`Unban ${member?.user?.nickname}`}
                    type="submit"
                    name="unbanUserId"
                    value={member?.userId}
                    variant="error"
                  >
                    Unban
                  </Button>
                </Form>
              </div>
            ))}
          </>
        ) : (
          <Typography variant="sm" customColor="text-gray-400">
            No banned members
          </Typography>
        )}
      </Card.Body>
    </Card>
  );
}
