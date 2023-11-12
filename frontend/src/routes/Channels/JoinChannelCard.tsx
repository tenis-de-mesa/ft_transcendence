import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Input,
  Overlay,
  Typography,
} from "../../components";
import { Form, useActionData } from "react-router-dom";
import { FiX } from "react-icons/fi";

type JoinChannelCardProps = {
  id: number;
  handleClose: () => void;
};

export default function JoinChannelCard({
  id,
  handleClose,
}: JoinChannelCardProps) {
  const [password, setPassword] = useState("");
  const error = useActionData() as { message: string };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#join-channel-card")) {
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
        id="join-channel-card"
        className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 z-[1001] min-w-[27rem]"
      >
        <Card.Title
          hr={false}
          className="flex justify-between items-center gap-3"
        >
          <Typography variant="h6" customWeight="bold">
            Join protected channel
          </Typography>
          <Button
            variant="info"
            size="sm"
            IconOnly={<FiX />}
            onClick={handleClose}
          ></Button>
        </Card.Title>
        <Card.Body position="left" className="space-y-4">
          <Form className="space-y-3" action={`${id}/join`} method="POST">
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Channel password"
            />
            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="info"
              disabled={!password.length}
            >
              Join
            </Button>
          </Form>

          {error?.message && (
            <Alert severity="error" className="w-full">
              {error.message}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
