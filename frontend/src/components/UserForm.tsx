import { useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import { User } from "../types/types";
import { Input } from "./Input";
import { Button } from "./Button";

interface UserFormProps {
  user: User;
}

export default function UserForm({ user }: UserFormProps) {
  const [nickname, setNickname] = useState(user.nickname);
  const navigate = useNavigate();

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
    <Form>
      <Input
        disabled
        label="Login"
        value={user.login}
        placeholder=""
        type="text"
      />
      <Input
        label="Nickname"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        placeholder=""
        type="text"
      />
      <center>
        <Button
          variant="primary"
          size="sm"
          className="inline m-2"
          onClick={() => update(nickname)}
        >
          Atualizar
        </Button>
      </center>
    </Form>
  );
}
