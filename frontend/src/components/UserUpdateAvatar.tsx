import { useRef, useState } from "react";
import { User } from "../types/types";
import { Avatar } from "./Avatar";
import { Button } from "./Button";

interface UserFormProps {
  user: User;
}

export default function UserUpdateAvatar({ user }: UserFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("http://localhost:3001/users/avatar", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    if (!response.ok) {
      console.error("Failed to upload image");
      return;
    }
    const data = await response.json();
    setAvatarUrl(data.avatarUrl);
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className="inline-block mb-2" onClick={handleButtonClick}>
        <Avatar seed={user.login} src={avatarUrl} className="inline" />
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelected}
        id="file-input"
        style={{ display: "none", width: "0px" }}
        ref={fileInputRef}
      />
    </>
  );
}
