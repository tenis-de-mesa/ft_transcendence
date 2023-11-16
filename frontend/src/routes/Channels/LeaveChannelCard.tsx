import { useContext } from "react";
import { Alert, Button, Card, Typography } from "../../components";
import { useFetcher } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { ChatContext } from "../../contexts";

type LeaveChannelCardProps = {
  id: number;
};

export default function LeaveChannelCard({ id }: LeaveChannelCardProps) {
  const { closeCard } = useContext(ChatContext);
  const { Form, state, data: error } = useFetcher();

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
            onClick={closeCard}
          ></Button>
        </Card.Title>
        <Card.Body position="left">
          <Typography variant="md">
            Are you sure you want to leave this channel?
          </Typography>
        </Card.Body>
        <Card.Footer hr={false} className="space-y-3">
          <Form className="space-y-3" action={`${id}/leave`} method="POST">
            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="error"
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
