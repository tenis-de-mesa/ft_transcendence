import { useEffect, useRef, useState } from "react";
import { Card, Typography } from "../../components";
import { ChatMember, User } from "../../types";
import { socket } from "../../socket";

import ChatMemberItem from "./ChatMemberItem";
import ChatContextMenu from "./ChatContextMenu/ChatContextMenu";

const defaultProps = {
  member: {} as ChatMember,
  position: { top: 0, left: 0 },
  isOpen: false,
};

type ChatMemberListProps = {
  initialMembers: ChatMember[];
};

export default function ChatMemberList({
  initialMembers,
}: ChatMemberListProps) {
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<ChatMember[]>(initialMembers);
  const [users, setUsers] = useState<User[]>([]);
  const [props, setProps] = useState(defaultProps);

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User
  ) => {
    e.preventDefault();

    const top = e.clientY;
    let left = e.clientX;

    if (left + 320 > window.innerWidth) {
      left -= 320;
    }

    setProps({
      member: members.find((member) => member.userId === user.id),
      position: { top, left },
      isOpen: true,
    });
  };

  useEffect(() => {
    const nonDeletedUsers = members
      .filter((member) => !member?.user.deletedAt)
      .map((member) => member?.user);

    setUsers(nonDeletedUsers);
  }, [members]);

  useEffect(() => {
    socket.on("userAdded", (member: ChatMember) =>
      setMembers((members) => [...members, member])
    );

    socket.on("userRemoved", (id: number) =>
      setMembers((members) => members.filter((member) => member.userId !== id))
    );

    return () => {
      socket.off("userAdded");
      socket.off("userRemoved");
    };
  }, []);

  useEffect(() => {
    const handleClick = () => setProps(defaultProps);
    window.addEventListener("click", handleClick);
    window.addEventListener("resize", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleClick);
    };
  }, []);

  return (
    <Card className="w-1/4">
      <Card.Title>
        <Typography variant="h6">Members - {users?.length}</Typography>
      </Card.Title>
      <Card.Body>
        <div className="flex flex-col">
          {users?.map((user) => (
            <div
              key={user.id}
              onContextMenu={(e) => handleContextMenu(e, user)}
            >
              <ChatMemberItem user={user} />
            </div>
          ))}
        </div>

        <ChatContextMenu
          contextMenuRef={contextMenuRef}
          member={props.member}
          isOpen={props.isOpen}
          position={props.position}
        />
      </Card.Body>
    </Card>
  );
}
