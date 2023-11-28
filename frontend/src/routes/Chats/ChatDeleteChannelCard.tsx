import { FiChevronLeft } from "react-icons/fi";
import { Button, Card, Typography } from "../../components";
import { Form } from "react-router-dom";
import { useContext } from "react";
import { ChatContext } from "../../contexts";

type ChatDeleteChannelCardProps = {
  onBack: () => void;
};

export default function ChatDeleteChannelCard({
  onBack,
}: ChatDeleteChannelCardProps) {
  const { currentChat, closeCard } = useContext(ChatContext);

  return (
    <Card
      id="delete-channel-card"
      className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/3 left-1/2 z-[1001] min-w-[27rem] dark:bg-gray-900"
    >
      <Card.Title
        hr={false}
        className="flex justify-between items-center gap-3"
      >
        <Typography variant="h6" customWeight="bold">
          Delete channel confirmation
        </Typography>
        <Button
          variant="info"
          size="sm"
          IconOnly={<FiChevronLeft />}
          onClick={onBack}
        ></Button>
      </Card.Title>
      <Card.Body position="left">
        <Typography variant="md">
          Are you sure you want to delete this channel permanently?{"\n"}
        </Typography>
        <Typography variant="md" customWeight="bold">
          This action cannot be undone.
        </Typography>
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
          action={`${currentChat?.id}/delete`}
          method="DELETE"
          onSubmit={closeCard}
        >
          <Button
            className="justify-center w-full font-bold"
            type="submit"
            variant="error"
          >
            Delete channel
          </Button>
        </Form>
      </Card.Footer>
    </Card>
  );
}
