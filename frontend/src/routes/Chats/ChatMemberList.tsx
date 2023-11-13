import { useContext, useEffect, useRef, useState } from "react";
import { Card, Typography } from "../../components";
import { ChatMember, User } from "../../types";
import { socket } from "../../socket";

import ChatMemberItem from "./ChatMemberItem";
import ChatContextMenu from "./ChatContextMenu";
import { AuthContext } from "../../contexts";

const defaultProps = {
  member: {} as ChatMember,
  position: { top: 0, left: 0 },
  isOpen: false,
};

type ChatMemberListProps = {
  members: ChatMember[];
};

export default function ChatMemberList({ members }: ChatMemberListProps) {
  const { currentUser } = useContext(AuthContext);
  const contextMenuRef = useRef<HTMLDivElement>(null);
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
      .filter((member) => !member.user.deletedAt)
      .map((member) => member.user);

    setUsers(nonDeletedUsers);
  }, [members]);

  useEffect(() => {
    socket.on("userAdded", (user: User) => {
      setUsers((users) => [...users, user]);
    });

    socket.on("userRemoved", (user: User) => {
      setUsers((users) => users.filter((u) => u.id !== user.id));
    });

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
        <Typography variant="h6">Members - {users.length}</Typography>
      </Card.Title>
      <Card.Body>
        <div className="flex flex-col">
          {users.map((user) => (
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
          myRole={
            members.find((member) => member.userId === currentUser?.id)?.role
          }
        />
      </Card.Body>
    </Card>
  );
}
