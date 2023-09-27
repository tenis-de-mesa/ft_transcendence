import { Link, useRouteLoaderData } from "react-router-dom";
import { User } from "../types/types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import Avatar from "../components/Avatar";

export default function Profile() {
  const user = useRouteLoaderData("root") as User;

  const flipCard = () => {
    const alternate = document.querySelector(".flip-card .wrapper");
    if (alternate) {
      alternate.classList.toggle("flipped");
    }
  };

  return (
    <div className="profile">
      <div className="flip-card">
        <div className="wrapper">
          <div className="card back">
            <UserForm user={user} />
            <button onClick={flipCard} className="back-button">
              Voltar
            </button>
          </div>
          <div className="card front">
            <center>
              <Avatar login={user.login} avatarUrl={user.avatarUrl} />
              <h1>{user.nickname}</h1>
              <button onClick={flipCard} className="edit-button">
                Editar
              </button>
            </center>
            <hr />
            <p>
              <strong>Login:</strong> {user.login}
            </p>
            <p>
              <strong>Nickname:</strong> {user.nickname}
            </p>
            <Link to={"/logout"}>Sair</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
