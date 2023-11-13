import { useState } from "react";
import { Link, useFetcher } from "react-router-dom";
import { FiLock } from "react-icons/fi";
import { Alert, Badge, Button } from "../../components";

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
  const { Form, state, data: error } = useFetcher();
  const [isJoinCardOpen, setIsJoinCardOpen] = useState(false);
  const [isLeaveCardOpen, setIsLeaveCardOpen] = useState(false);

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
            onClick={() => setIsLeaveCardOpen(true)}
          >
            Leave
          </Button>

          {isLeaveCardOpen && (
            <LeaveChannelCard
              id={id}
              handleClose={() => setIsLeaveCardOpen(false)}
            />
          )}
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
            onClick={() => setIsJoinCardOpen(true)}
          >
            Join
          </Button>

          {isJoinCardOpen && (
            <JoinChannelCard
              id={id}
              handleClose={() => setIsJoinCardOpen(false)}
            />
          )}
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
