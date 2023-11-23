import { Button } from "./Button";
import { User } from "../types";
import { useContext } from "react";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";
import { LuSwords } from "react-icons/lu";

export function InviteGameButton({ user }: { user: User }) {
  const { currentUser } = useContext(AuthContext);
  const socket = useWebSocket();

  // Don't show a button to add yourself
  const isYou = user.id === currentUser.id;
  if (isYou) {
    return null;
  }

  return (
    <Button
      variant="info"
      size="sm"
      onClick={() => socket.emit("invitePlayerToGame", user.id)}
    >
      Play
    </Button>
  );
}
