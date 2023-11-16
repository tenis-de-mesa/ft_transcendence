import { useContext } from "react";
import { Link, useFetcher } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { Alert, Badge, Button } from "../../components";
import { ChatContext } from "../../contexts";

import JoinChannelCard from "./JoinChannelCard";
import LeaveChannelCard from "./LeaveChannelCard";

type ActionChannelButtonProps = {
  id: number;
  access: "public" | "protected" | "private";
  isOwner: boolean;
  isMember: boolean;
};

export default function ActionChannelButton({
  id,
  access,
  isOwner,
  isMember,
}: ActionChannelButtonProps) {
  const { setShowCard } = useContext(ChatContext);
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
            onClick={() => setShowCard(<LeaveChannelCard id={id} />)}
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
            onClick={() => setShowCard(<JoinChannelCard id={id} />)}
          >
            Join
          </Button>
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
