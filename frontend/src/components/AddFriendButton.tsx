import { FiPlus, FiX } from "react-icons/fi";
import { Button } from "./Button";
import { User } from "../types/types";
import { RootUser } from "../routes/Root";
import { useState } from "react";

export const AddFriendButton = ({ user }: { user: User }) => {
  const currentUser = RootUser();
  const [isFriend, setIsFriend] = useState(
    user.friends.some((friend) => friend.id === currentUser.id)
  );

  // Don't show a button to add yourself
  const isYou = user.id === currentUser.id;
  if (isYou) {
    return null;
  }

  const handleAddFriend = async (userId: number) => {
    const response = await fetch(`http://localhost:3001/users/friends`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId: userId }),
    });
    if (response.ok) {
      setIsFriend(true);
    } else {
      const error = await response.json();
      console.error(error);
    }
  };

  const handleRemoveFriend = async (userId: number) => {
    const response = await fetch(
      `http://localhost:3001/users/friends/${userId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );
    if (response.ok) {
      setIsFriend(false);
    } else {
      console.error("Friend not removed");
    }
  };

  if (isFriend) {
    return (
      <Button
        variant={"error"}
        LeadingIcon={<FiX />}
        size="sm"
        onClick={() => handleRemoveFriend(user.id)}
      >
        Remove friend
      </Button>
    );
  }

  return (
    <Button
      variant="info"
      size="sm"
      LeadingIcon={<FiPlus />}
      onClick={() => handleAddFriend(user.id)}
    >
      Add friend
    </Button>
  );
};
