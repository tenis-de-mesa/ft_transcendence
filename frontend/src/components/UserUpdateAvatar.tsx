import { useContext, useRef, useState } from "react";
import { User } from "../types";
import { Avatar } from "./Avatar";
import { FaPencilAlt } from "react-icons/fa";
import { AuthContext } from "../contexts";
import { Alert } from ".";

interface UserFormProps {
  user: User;
}

export const UserUpdateAvatar = ({ user }: UserFormProps) => {
  const { setCurrentUser } = useContext(AuthContext);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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
    const response = await fetch(
      "https://transcendence.ngrok.app/api/users/avatar",
      {
        method: "POST",
        body: formData,
        credentials: "include",
      }
    );
    if (!response.ok) {
      setError(response.statusText);
      return;
    }
    setError(null);
    const data = await response.json();
    setAvatarUrl(data.avatarUrl);
    setCurrentUser((prevUser) => ({ ...prevUser, avatarUrl: data.avatarUrl }));
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div className="inline-block mb-2 hover:cursor-pointer relative mt-5">
        <Avatar seed={user.login} src={avatarUrl} className="inline" />
        <div
          className="absolute inset-0 flex justify-end items-end hover:cursor-pointer hover:bg-gray-200 hover:bg-opacity-50 rounded-full"
          onClick={handleButtonClick}
        >
          <span className="p-1 border-2 rounded-full bg-white">
            <FaPencilAlt />
          </span>
        </div>
      </div>
      {error && (
        <Alert severity="error" className="w-full my-5">
          {error}
        </Alert>
      )}
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
};
