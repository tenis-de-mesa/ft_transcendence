import { useEffect } from "react";
import { Alert, Button, Card, Overlay, Typography } from "../../components";
import { Form, useActionData } from "react-router-dom";
import { FiX } from "react-icons/fi";

type LeaveChannelCardProps = {
  id: number;
  handleClose: () => void;
};

export default function LeaveChannelCard({
  id,
  handleClose,
}: LeaveChannelCardProps) {
  const error = useActionData() as { message: string };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#leave-channel-card")) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleClose]);

  return (
    <>
      <Overlay />

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
            onClick={handleClose}
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
              Leave channel
            </Button>
          </Form>

          {error?.message && (
            <Alert severity="error" className="w-full">
              {error.message}
            </Alert>
          )}
        </Card.Footer>
      </Card>
    </>
  );
}
