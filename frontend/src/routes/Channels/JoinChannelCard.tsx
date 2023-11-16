import { useContext, useState } from "react";
import { useFetcher } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Alert, Button, Card, Input, Typography } from "../../components";
import { ChatContext } from "../../contexts";

type JoinChannelCardProps = {
  id: number;
};

export default function JoinChannelCard({ id }: JoinChannelCardProps) {
  const { closeCard } = useContext(ChatContext);
  const [password, setPassword] = useState("");
  const { Form, state, data: error } = useFetcher();

  return (
    <>
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
            onClick={closeCard}
          ></Button>
        </Card.Title>
        <Card.Body position="left" className="space-y-4">
          <Form
            className="space-y-3"
            action={`${id}/join`}
            method="POST"
            onSubmit={() => setPassword("")}
          >
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Channel password"
              error={!!error?.message && state === "idle"}
            />
            <Button
              className="justify-center w-full font-bold"
              type="submit"
              variant="info"
              disabled={!password.length}
            >
              {state === "loading" ? "Loading..." : "Join"}
            </Button>
          </Form>

          {error?.message && state === "idle" && (
            <Alert severity="error" className="w-full">
              {error.message}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </>
  );
}
