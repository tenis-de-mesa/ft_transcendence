import { Button } from "./Button";
import { User } from "../types";
import { useContext } from "react";
import { AuthContext } from "../contexts";
import { LuMessageSquare } from "react-icons/lu";
import { Link } from "react-router-dom";

export function ChatButton({
  user,
  className,
}: {
  user: User;
  className?: string;
}) {
  const { currentUser } = useContext(AuthContext);

  const isYou = user.id === currentUser.id;
  if (isYou) {
    return null;
  }

  return (
    <Link to={`/chats/with/${user.id}`} className={className}>
      <Button
        className="w-full"
        variant="info"
        size="sm"
        LeadingIcon={<LuMessageSquare />}
      >
        Send message
      </Button>
    </Link>
  );
}
