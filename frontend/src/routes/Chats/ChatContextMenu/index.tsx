import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ChatMember } from "../../../types";
import { AuthContext, ChatContext } from "../../../contexts";

import ChatContextMenuItem from "./ChatContextMenuItem";
import ChatBanMemberCard from "../ChatBanMemberCard";
import ChatKickMemberCard from "../ChatKickMemberCard";
import ChatMuteMemberCard from "../ChatMuteMemberCard";

type ChatContextMenuProps = {
  member: ChatMember;
  isOpen: boolean;
  position: { top: number; left: number };
  contextMenuRef: React.RefObject<HTMLElement>;
};

export default function ChatContextMenu({
  member,
  isOpen,
  position,
  contextMenuRef,
}: ChatContextMenuProps) {
  const { currentUser } = useContext(AuthContext);
  const { userRole, setShowCard } = useContext(ChatContext);
  const { role, user } = member;
  const navigate = useNavigate();

  return (
    <menu
      ref={contextMenuRef}
      // FIXME: For some reason, Tailwind doesn't work for setting top and left
      className={`flex-col absolute p-2 rounded bg-gray-900 text-white w-[320px] overflow-y-auto
      ${isOpen ? "flex" : "hidden"}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <ChatContextMenuItem
        onClick={() => navigate(`/profile/${member.userId}`)}
      >
        Go to profile
      </ChatContextMenuItem>

      <ChatContextMenuItem
        onClick={() => navigate(`/chats/with/${member.userId}`)}
      >
        Send message
      </ChatContextMenuItem>

      {user?.id !== currentUser?.id && userRole !== "member" && (
        <>
          {role !== "owner" && (
            <>
              <ChatContextMenuItem
                separator={true}
                onClick={() => setShowCard(<ChatMuteMemberCard user={user} />)}
              >
                Mute {user?.nickname}
              </ChatContextMenuItem>

              <ChatContextMenuItem
                onClick={() => setShowCard(<ChatKickMemberCard user={user} />)}
              >
                Kick {user?.nickname}
              </ChatContextMenuItem>

              <ChatContextMenuItem
                onClick={() =>
                  setShowCard(<ChatBanMemberCard nickname={user?.nickname} />)
                }
              >
                Ban {user?.nickname}
              </ChatContextMenuItem>
            </>
          )}

          {role === "admin" && (
            <>
              <ChatContextMenuItem separator={true}>
                Revoke admin privilege
              </ChatContextMenuItem>
            </>
          )}

          {role === "member" && (
            <>
              <ChatContextMenuItem separator={true}>
                Grant admin privilege
              </ChatContextMenuItem>
            </>
          )}
        </>
      )}
    </menu>
  );
}
