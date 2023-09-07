import { useState } from "react";

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
};

export default function Update(props: { nickname: string }) {
  const [nickname, setNickname] = useState(props.nickname ?? "");

  return (
    <form>
      <h1>Update</h1>
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
      <button
        onClick={() => {
          updateUser(nickname);
        }}
      >
        Update
      </button>
    </form>
  );
}
