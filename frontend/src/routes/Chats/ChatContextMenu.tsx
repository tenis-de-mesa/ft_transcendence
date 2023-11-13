import { useContext } from "react";
import { ChatMember } from "../../types";
import { AuthContext, ChatContext } from "../../contexts";

function Separator() {
  return <hr className="my-2 bg-gray-600 border-gray-600" />;
}

function ChatContextMenuItem({ children }) {
  return (
    <span className="p-2 cursor-pointer rounded text-left break-keep whitespace-nowrap hover:bg-gray-700">
      {children}
    </span>
  );
}

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
  const { userRole } = useContext(ChatContext);
  const { role, user } = member;

  return (
    <menu
      ref={contextMenuRef}
      // FIXME: For some reason, Tailwind doesn't work for setting top and left
      className={`flex-col absolute p-2 rounded bg-gray-900 text-white w-[320px] overflow-y-auto
      ${isOpen ? "flex" : "hidden"}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      <ChatContextMenuItem>Go to profile</ChatContextMenuItem>
      <ChatContextMenuItem>Send message</ChatContextMenuItem>

      {user?.id !== currentUser?.id && userRole !== "member" && (
        <>
          {role !== "owner" && (
            <>
              <Separator />

              <ChatContextMenuItem>Kick {user?.nickname}</ChatContextMenuItem>
              <ChatContextMenuItem>Mute {user?.nickname}</ChatContextMenuItem>
              <ChatContextMenuItem>Ban {user?.nickname}</ChatContextMenuItem>
            </>
          )}

          {role === "admin" && (
            <>
              <Separator />
              <ChatContextMenuItem>Revoke admin privilege</ChatContextMenuItem>
            </>
          )}

          {role === "member" && (
            <>
              <Separator />
              <ChatContextMenuItem>Grant admin privilege</ChatContextMenuItem>
            </>
          )}
        </>
      )}
    </menu>
  );
}
