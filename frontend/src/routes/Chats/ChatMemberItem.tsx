import classNames from "classnames";
import { Avatar, Typography } from "../../components";
import { User } from "../../types";

type ChatMemberItemProps = {
  user: User;
};

export default function ChatMemberItem({ user }: ChatMemberItemProps) {
  return (
    <div className="flex flex-1 items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-700">
      <Avatar seed={user?.login} src={user?.avatarUrl} size="sm" />
      <div className="text-left">
        <Typography variant="md">{user?.nickname}</Typography>
        <div className="flex items-center gap-1">
          <div
            className={classNames("w-2", "h-2", "rounded-full", {
              "bg-success-500": user?.status === "online",
              "bg-gray-500": user?.status === "offline",
            })}
          ></div>
          <Typography
            variant="xs"
            customColor="text-gray-500"
            className="-translate-y-[.09rem]"
          >
            {user?.status}
          </Typography>
        </div>
      </div>
    </div>
  );
}
