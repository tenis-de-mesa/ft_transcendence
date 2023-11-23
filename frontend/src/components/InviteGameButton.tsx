import { TbPingPong } from "react-icons/tb";
import { Button } from "./Button";
import { User } from "../types";
import { useContext } from "react";
import { AuthContext } from "../contexts";
import { useWebSocket } from "../hooks";

export function InviteGameButton({ user }: { user: User }) {
    const { currentUser } = useContext(AuthContext);

    // Don't show a button to add yourself
    const isYou = user.id === currentUser.id;
    if (isYou) {
        return null;
    }

    const socket = useWebSocket();

    return (
        <Button
            variant="error"
            size="sm"
            LeadingIcon={<TbPingPong />}
            onClick={() =>
                socket.emit("invitePlayerToGame", user)
            }
        >
            Invite Game
        </Button>
    );
};
