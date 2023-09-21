import { useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import { User } from "../types/types";
import Avatar from "./Avatar";

interface UserFormProps {
  user: User;
}

export default function UserForm({ user }: UserFormProps) {
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [nickname, setNickname] = useState(user.nickname);
  const navigate = useNavigate();
  const handleUpdateAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>,
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

  const update = async (nickname: string) => {
    await fetch("http://localhost:3001/users/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname }),
      credentials: "include",
    });
    navigate(".", { replace: true });
  };
  return (
    <>
      <center>
        <Avatar login={user.login} avatarUrl={avatarUrl} />
      </center>
      <center>
        <label>
          Alterar imagem
          <input
            type="file"
            accept="image/*"
            onChange={handleUpdateAvatar}
            id="file-input"
            style={{ display: "none" }}
          />
        </label>
      </center>
      <hr />
      <Form>
        <h3>{user.login}</h3>
        <div>
          <label>
            Nickname:
            <input
              type="text"
              name="name"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </label>
        </div>
        <button onClick={() => update(nickname)}>Atualizar</button>
      </Form>
    </>
  );
}
