import Avatar from "./Avatar";
import { User } from "../types/types";
import { Link } from "react-router-dom";

interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="container">
      <div className="card">
        <center>
          <Avatar login={user.login} avatarUrl={user.avatarUrl} />
        </center>
        <h1>Welcome {user.nickname}!</h1>
        <p>
          <strong>Login:</strong> {user.login}
        </p>
        <p>
          <strong>Nickname:</strong> {user.nickname}
        </p>
        <p>
          <strong>Avatar:</strong> {user.avatarUrl}
        </p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Link to={"profile"}>Editar</Link>
          <Link to={"logout"}>Sair</Link>
        </div>
      </div>
    </div>
  );
}
