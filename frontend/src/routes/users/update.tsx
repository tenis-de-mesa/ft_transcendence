import { useState } from "react";
import { Form, useNavigate } from "react-router-dom";

export default function Update(props: { nickname: string }) {
  const [nickname, setNickname] = useState(props.nickname ?? "");
  const navigate = useNavigate();

  const updateUser = async (nickname: string) => {
    await fetch("http://localhost:3001/users/", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nickname }),
      credentials: "include",
    });
    navigate("..");
  };

  return (
    <Form>
      <label>
        Nickname:
        <input
          type="text"
          name="name"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
      </label>
      <br />
      <button onClick={() => updateUser(nickname)}>Atualizar</button>
    </Form>
  );
}
