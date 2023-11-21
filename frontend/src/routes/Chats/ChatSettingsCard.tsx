import { useContext } from "react";
import { FiX } from "react-icons/fi";
import { ChatContext } from "../../contexts";
import { Card, Typography, Button } from "../../components";

import ChatChangePasswordCard from "./ChatChangePasswordCard";
import ChatManageMutedMembersCard from "./ChatManageMutedMembersCard";

export default function ChatSettingsCard() {
  const { setShowCard, closeCard } = useContext(ChatContext);

  return (
    <Card
      id="chat-settings-card"
      className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
    >
      <Card.Title className="flex items-center justify-between">
        <Typography variant="h6" customWeight="bold">
          Chat settings
        </Typography>
        <Button
          IconOnly={<FiX />}
          size="md"
          variant="info"
          onClick={closeCard}
        />
      </Card.Title>
      <Card.Body className="flex flex-col gap-3 [&>*]:font-bold [&>*]:justify-center">
        <Button
          variant="info"
          onClick={() =>
            setShowCard(
              <ChatChangePasswordCard
                onBack={() => setShowCard(<ChatSettingsCard />)}
              />
            )
          }
        >
          Manage channel password
        </Button>
        <Button
          variant="info"
          onClick={() =>
            setShowCard(
              <ChatManageMutedMembersCard
                onBack={() => setShowCard(<ChatSettingsCard />)}
              />
            )
          }
        >
          Manage muted members
        </Button>
        <Button variant="info" onClick={() => {}}>
          Manage banned members
        </Button>
        <Button variant="error" onClick={() => {}}>
          Leave channel
        </Button>
      </Card.Body>
    </Card>
  );
}
