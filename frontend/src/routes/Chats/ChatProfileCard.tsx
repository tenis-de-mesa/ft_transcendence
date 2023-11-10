import { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { LiaUserSlashSolid, LiaUserSolid } from "react-icons/lia";
import { FiX } from "react-icons/fi";
import { User } from "../../types";
import { AuthContext } from "../../contexts";
import { blockUser, unblockUser } from "../../actions/blockUser";
import { Avatar, Button, Card, Overlay, Typography } from "../../components";

type ChatProfileCardProps = {
  user: User;
  handleClose: () => void;
};

export default function ChatProfileCard({
  user,
  handleClose,
}: ChatProfileCardProps) {
  const { currentUser } = useContext(AuthContext);

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

  // Add event listener to close profile card when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Element;

      if (!target.closest("#profile-card")) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [handleClose]);

  return (
    <>
      <Overlay />

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
              onClick={handleClose}
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
