import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography } from "../../components";
import { ChatMember, User } from "../../types";
import { AuthContext } from "../../contexts";
import { socket } from "../../socket";

import ChatMemberItem from "./ChatMemberItem";
import ChatContextMenu from "./ChatContextMenu";

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
  const { currentUser } = useContext(AuthContext);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<ChatMember[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [props, setProps] = useState(defaultProps);
  const navigate = useNavigate();

  const handleContextMenu = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    user: User,
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
    setMembers(initialMembers);
  }, [initialMembers]);

  useEffect(() => {
    const nonDeletedUsers = members
      .filter(
        (member) => !member?.user.deletedAt && member?.status !== "banned",
      )
      .map((member) => member?.user);

    setUsers(nonDeletedUsers);
  }, [members]);

  useEffect(() => {
    socket.on("userAdded", (member: ChatMember) =>
      setMembers((members) => [...members, member]),
    );

    socket.on("userRemoved", (id: number) => {
      if (id === currentUser?.id) {
        return navigate("/chats", { replace: true });
      }

      setMembers((members) => members.filter((member) => member.userId !== id));
    });

    socket.on("userBanned", (id: number) => {
      if (id === currentUser?.id) {
        return navigate("/chats", { replace: true });
      }

      setMembers((members) => members.filter((member) => member.userId !== id));
    });

    socket.on("userRoleUpdated", (member: ChatMember) => {
      setMembers((members) => {
        const index = members.findIndex((m) => m.userId === member.userId);

        members[index] = member;

        return [...members];
      });
    });

    return () => {
      socket.off("userAdded");
      socket.off("userRemoved");
      socket.off("userBanned");
      socket.off("userRoleUpdated");
    };
  }, [currentUser?.id, navigate]);

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
    <Card className="w-1/3">
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
