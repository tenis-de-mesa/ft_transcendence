import { useContext, useEffect, useState } from "react";
import { Alert, Avatar, Button, Card, Typography } from "../../components";
import { useFetcher } from "react-router-dom";
import { FiChevronLeft } from "react-icons/fi";
import { AuthContext, ChatContext } from "../../contexts";
import { makeRequest } from "../../api";
import { ChatMember } from "../../types";

type ChatLeaveCardProps = {
  onBack: () => void;
};

export default function ChatLeaveCard({ onBack }: ChatLeaveCardProps) {
  const { currentChat, closeCard, userRole } = useContext(ChatContext);
  const { currentUser } = useContext(AuthContext);
  const { Form, state, data: error } = useFetcher();
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [selectedNewOwnerId, setSelectedNewOwnerId] = useState(null);

  const disabled =
    userRole === "owner" && members?.length > 1 && selectedNewOwnerId === null;

  const toggleNewOwnerSelection = (userId: number) => {
    if (selectedNewOwnerId === userId) {
      setSelectedNewOwnerId(null);
    } else {
      setSelectedNewOwnerId(userId);
    }
  };

  useEffect(() => {
    const fetchBannedMembers = async () => {
      const { data, error } = await makeRequest<ChatMember[]>(
        `/chats/${currentChat?.id}/members`,
        { method: "GET" }
      );

      if (error) {
        console.error(error);
      }

      setMembers(data as ChatMember[]);
    };

    fetchBannedMembers();
  }, [currentChat?.id]);

  return (
    <>
      <Card
        id="leave-channel-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
      >
        <Card.Title
          hr={false}
          className="flex justify-between items-center gap-3"
        >
          <Typography variant="h6" customWeight="bold">
            Leave channel confirmation
          </Typography>
          <Button
            variant="info"
            size="sm"
            IconOnly={<FiChevronLeft />}
            onClick={onBack}
          ></Button>
        </Card.Title>
        <Card.Body position="left">
          {userRole === "owner" ? (
            <>
              {members?.length === 1 ? (
                <Typography variant="md">
                  You are the only member of this channel. If you leave, the
                  channel will be deleted.
                </Typography>
              ) : (
                <div className="space-y-2">
                  <Typography variant="md">
                    Since you are the owner of this channel, you must nominate a
                    new owner before leaving.
                  </Typography>

                  <ul>
                    {members.map((member) => {
                      if (member.userId === currentUser?.id) {
                        return null;
                      }

                      return (
                        <li
                          key={member.userId}
                          className={`w-full px-4 py-2 rounded-md ${
                            selectedNewOwnerId === member.userId
                              ? "bg-info-700 hover:bg-info-900"
                              : "hover:bg-gray-700"
                          } `}
                          onClick={() => toggleNewOwnerSelection(member.userId)}
                        >
                          <Typography variant="md" as="label">
                            <div className="flex items-center gap-3">
                              <Avatar
                                seed={member.user?.login}
                                size="sm"
                                src={member.user?.avatarUrl}
                              />
                              {member.user?.nickname}
                            </div>
                          </Typography>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <Typography variant="md">
              Are you sure you want to leave this channel?
            </Typography>
          )}
        </Card.Body>
        <Card.Footer className="flex justify-end items-center gap-3">
          <div onClick={closeCard}>
            <Typography
              variant="md"
              className="cursor-pointer select-none hover:decoration-solid hover:underline"
            >
              Cancel
            </Typography>
          </div>

          <Form
            className="space-y-3"
            action={`${currentChat?.id}/leave`}
            method="POST"
            onSubmit={closeCard}
          >
            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="error"
              name="newOwnerId"
              value={selectedNewOwnerId}
              disabled={disabled}
            >
              {state === "loading" ? "Loading..." : "Leave"}
            </Button>
          </Form>

          {error?.message && state === "idle" && (
            <Alert severity="error" className="w-full">
              {error.message}
            </Alert>
          )}
        </Card.Footer>
      </Card>
    </>
  );
}
