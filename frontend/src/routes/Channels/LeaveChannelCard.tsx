import { Form } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Button, Card, Typography } from "../../components";

type LeaveChannelCardProps = {
  id: number;
  onClose: () => void;
};

export default function LeaveChannelCard({
  id,
  onClose,
}: LeaveChannelCardProps) {
  return (
    <>
      <Card
        id="leave-channel-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-[1001] min-w-[27rem]"
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
            IconOnly={<FiX />}
            onClick={onClose}
          ></Button>
        </Card.Title>
        <Card.Body position="left">
          <Typography variant="md">
            Are you sure you want to leave this channel?
          </Typography>
        </Card.Body>
        <Card.Footer hr={false} className="space-y-3">
          <Form
            className="space-y-3"
            action={`${id}/leave`}
            method="POST"
            onSubmit={onClose}
          >
            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="error"
            >
              Leave
            </Button>
          </Form>
        </Card.Footer>
      </Card>
    </>
  );
}
