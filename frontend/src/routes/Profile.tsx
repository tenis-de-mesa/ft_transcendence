import { Link, useRouteLoaderData } from "react-router-dom";
import { User } from "../types/types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import Avatar from "../components/Avatar";

export default function Profile() {
  const user = useRouteLoaderData("root") as User;

  return (
    <div className="profile">
      <div className="card">
        <center>
          <Avatar login={user.login} avatarUrl={user.avatarUrl} />
        </center>
        <center>
          <h1>{user.nickname}</h1>
        </center>
        <hr />
        <p>
          <strong>Login:</strong> {user.login}
        </p>
        <p>
          <strong>Nickname:</strong> {user.nickname}
        </p>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <Link to={"/logout"}>Sair</Link>
        </div>
      </div>
      <h2>
        TODO:
        <br /> Botão de edit troca o card acima pelo abaixo
      </h2>
      <div className="card">
        <UserForm user={user} />
      </div>
    </div>
  );
}
