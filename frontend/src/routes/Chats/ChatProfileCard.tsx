import { useContext } from "react";
import { Link } from "react-router-dom";
import { LiaUserSlashSolid, LiaUserSolid } from "react-icons/lia";
import { FiX } from "react-icons/fi";
import { User } from "../../types";
import { AuthContext, ChatContext } from "../../contexts";
import { blockUser, unblockUser } from "../../actions/blockUser";
import { Avatar, Button, Card, Typography } from "../../components";

type ChatProfileCardProps = {
  user: User;
};

export default function ChatProfileCard({ user }: ChatProfileCardProps) {
  const { currentUser } = useContext(AuthContext);
  const { closeCard } = useContext(ChatContext);

  // TODO: Auto update blocked users to display proper buttons

  const checkUserIsBlocked = (userBlockedId: number) => {
    return currentUser.blockedUsers.includes(userBlockedId);
  };

  const handleUserBlock = () => {
    blockUser(user?.id);
  };

  const handleUserUnblock = () => {
    unblockUser(user?.id);
  };

  return (
    <>
      <Card
        id="profile-card"
        className="absolute z-[1001] w-1/3 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 dark:bg-gray-900"
      >
        <Card.Title
          hr={!user.deletedAt}
          className="flex items-center justify-center"
        >
          <div className="flex flex-1 ">
            <Avatar size="sm" seed={user?.login} src={user?.avatarUrl} />
          </div>

          <Typography variant="h6">
            {!user.deletedAt ? (
              <Link to={`/profile/${user?.id}`}>{user?.nickname}</Link>
            ) : (
              "Deleted user"
            )}
          </Typography>

          <div className="flex gap-1 flex-1 justify-end">
            {!user.deletedAt &&
              currentUser.id !== user?.id &&
              (checkUserIsBlocked(user?.id) ? (
                <Button
                  size="md"
                  variant="success"
                  title="Unblock"
                  IconOnly={<LiaUserSolid />}
                  onClick={handleUserUnblock}
                />
              ) : (
                <Button
                  size="md"
                  variant="error"
                  title="Block"
                  IconOnly={<LiaUserSlashSolid />}
                  onClick={handleUserBlock}
                />
              ))}

            <Button
              IconOnly={<FiX />}
              size="md"
              variant="info"
              title="Close"
              onClick={closeCard}
            />
          </div>
        </Card.Title>
        {!user.deletedAt && (
          <Card.Body>
            <Typography variant="sm">
              <strong>Nickname:</strong> {user?.nickname}
            </Typography>
          </Card.Body>
        )}
      </Card>
    </>
  );
}
