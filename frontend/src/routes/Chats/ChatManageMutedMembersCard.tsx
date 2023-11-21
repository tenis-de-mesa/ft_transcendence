import { useContext, useEffect, useState } from "react";
import { useFetcher } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { BiSolidUserVoice } from "react-icons/bi";
import { makeRequest } from "../../api";
import { ChatMember } from "../../types";
import { ChatContext } from "../../contexts";
import { Button, Card, Typography } from "../../components";

import ChatMemberItem from "./ChatMemberItem";
import { socket } from "../../socket";

type ChatManageMutedMembersCardProps = {
  onBack: () => void;
};

export default function ChatManageMutedMembersCard({
  onBack,
}: ChatManageMutedMembersCardProps) {
  const { currentChat } = useContext(ChatContext);
  const [mutedMembers, setMutedMembers] = useState<ChatMember[]>([]);
  const { Form } = useFetcher();

  useEffect(() => {
    const fetchMutedMembers = async () => {
      const { data, error } = await makeRequest<ChatMember[]>(
        `/chats/${currentChat?.id}/members/muted`,
        { method: "GET" }
      );

      if (error) {
        console.error(error);
      }

      setMutedMembers(data as ChatMember[]);
    };

    fetchMutedMembers();
  }, [currentChat?.id]);

  useEffect(() => {
    socket.on("userUnmuted", (unmuteUserId: number) => {
      setMutedMembers((prev) =>
        prev.filter((member) => member?.userId !== unmuteUserId)
      );
    });
  }, []);

  return (
    <Card
      id="change-password-card"
      className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
    >
      <Card.Title className="flex items-center justify-between">
        <Typography variant="h6">Muted members</Typography>
        <Button
          IconOnly={<FiChevronLeft />}
          size="md"
          variant="info"
          onClick={onBack}
        />
      </Card.Title>
      <Card.Body>
        {mutedMembers.length > 0 ? (
          <>
            {mutedMembers.map((member: ChatMember) => (
              <div
                key={member?.userId}
                className="flex justify-between items-center gap-2"
              >
                <ChatMemberItem user={member?.user} />
                <Form action={`${currentChat?.id}/unmute`} method="POST">
                  <Button
                    title={`Unmute ${member?.user?.nickname}`}
                    type="submit"
                    name="unmuteUserId"
                    value={member?.userId}
                    IconOnly={<BiSolidUserVoice />}
                    variant="success"
                  />
                </Form>
              </div>
            ))}
          </>
        ) : (
          <Typography variant="sm" customColor="text-gray-400">
            No muted members
          </Typography>
        )}
      </Card.Body>
    </Card>
  );
}
