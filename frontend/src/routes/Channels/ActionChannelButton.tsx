import { useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { Alert, Badge, Button, Overlay } from "../../components";

import JoinChannelCard from "./JoinChannelCard";
import LeaveChannelCard from "./LeaveChannelCard";
import { ChatAccess } from "../../types";

type ActionChannelButtonProps = {
  id: number;
  access: ChatAccess;
  isOwner: boolean;
  isMember: boolean;
};

export default function ActionChannelButton({
  id,
  access,
  isOwner,
  isMember,
}: ActionChannelButtonProps) {
  const [showCard, setShowCard] = useState<JSX.Element>(null);
  const { Form, state, data: error } = useFetcher();

  return (
    <>
      {isOwner ? (
        <Link to={`/chats/${id}`}>
          <Badge variant="success" size="md">
            Owner
          </Badge>
        </Link>
      ) : isMember ? (
        <>
          <Button
            variant="error"
            size="sm"
            onClick={() =>
              setShowCard(
                <LeaveChannelCard id={id} onClose={() => setShowCard(null)} />,
              )
            }
          >
            Leave
          </Button>
        </>
      ) : access == "public" ? (
        <Form action={`${id}/join`} method="POST">
          <Button variant="info" size="sm" type="submit">
            {state === "loading" ? "Joining..." : "Join"}
          </Button>
        </Form>
      ) : (
        <>
          <Button
            variant="info"
            size="sm"
            TrailingIcon={<FiLock />}
            onClick={() =>
              setShowCard(
                <JoinChannelCard id={id} onClose={() => setShowCard(null)} />,
              )
            }
          >
            Join
          </Button>
        </>
      )}

      {showCard && (
        <>
          <Overlay />
          {showCard}
        </>
      )}

      {error?.message && state === "idle" && (
        <Alert severity="error" className="w-full">
          {error.message}
        </Alert>
      )}
    </>
  );
}
