import { useRouteLoaderData } from "react-router-dom";
import { UpdateUser } from "./users";
import { User } from "../types/types";

import "./shared.css";
import { useRef, useState } from "react";
import Avatar from "./Avatar";

export default function Profile() {
  const user = useRouteLoaderData("root") as User;

  const [avatarPath, setAvatarPath] = useState(user.avatarPath);

  const handleUpdateAvatar = async (
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
    setAvatarPath(data.avatarPath);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChooseAvatar = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile">
      <div className="card">
        <center>
          <Avatar login={user.login} path={avatarPath} />
        </center>
        <center>
          <button onClick={handleChooseAvatar}>Alterar avatar</button>
        </center>
        <hr />
        <UpdateUser nickname={user.nickname} />
        <input
          type="file"
          accept="image/*"
          onChange={handleUpdateAvatar}
          ref={fileInputRef}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}
