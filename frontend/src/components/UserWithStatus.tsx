import classNames from "classnames";
import { FC, useEffect, useState } from "react";
import { User, UserStatus } from "../types";
import { Avatar, AvatarProps, Typography } from "../components";
import { useWebSocket } from "../hooks";

export interface UserWithStatusProps {
  user: User;
  avatarSize?: AvatarProps["size"] | "none";
}

export const UserWithStatus: FC<UserWithStatusProps> = ({
  user,
  avatarSize = "sm",
}) => {
  const socket = useWebSocket();
  const [userStatus, setUserStatus] = useState(user.status);

  useEffect(() => {
    socket.on("userStatus", ({ id, status }: UserStatus) => {
      if (user.id === id) {
        setUserStatus(status);
      }
    });

    return () => {
      socket.off("userStatus");
    };
  }, [socket, user.id]);

  return (
    <div className="flex items-center gap-2">
      {avatarSize !== "none" && (
        <Avatar seed={user.login} src={user.avatarUrl} size={avatarSize} />
      )}
      <div className="text-left">
        <Typography variant="md">{user.nickname}</Typography>
        <div className="flex items-center gap-1">
          <div
            className={classNames("w-2", "h-2", "rounded-full", {
              "bg-success-500": userStatus === "online",
              "bg-gray-500": userStatus === "offline",
              "bg-info-500": userStatus === "in_game",
            })}
          ></div>
          <Typography
            variant="xs"
            customColor="text-gray-500"
            className="-translate-y-[.09rem]"
          >
            {userStatus === "in_game" && "In Game ⚔️"}
            {userStatus === "online" && "Online"}
            {userStatus === "offline" && "Offline"}
          </Typography>
        </div>
      </div>
    </div>
  );
};
