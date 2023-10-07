import { Link, useLoaderData, useParams, useRouteLoaderData } from "react-router-dom";
import { User } from "../types/types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import Avatar from "../components/Avatar";

export default function Profile() {
  const { id } = useParams();

  const userId = Number(id);
  const userMe = useRouteLoaderData("root") as User;
  const userOther = useLoaderData() as User;

  const flipCard = () => {
    const alternate = document.querySelector(".flip-card .wrapper");
    if (alternate) {
      alternate.classList.toggle("flipped");
    }
  };

  return (
    userId == userMe.id ? (
      <div className="profile">
        <div className="flip-card">
          <div className="wrapper">
            <div className="card back">
              <UserForm user={userMe} />
              <button onClick={flipCard} className="back-button">
                Voltar
              </button>
            </div>
            <div className="card front">
              <center>
                <Avatar login={userMe.login} avatarUrl={userMe.avatarUrl} />
                <h1>{userMe.nickname}</h1>
                <button onClick={flipCard} className="edit-button">
                  Editar
                </button>
              </center>
              <hr />
              <p>
                <strong>Login:</strong> {userMe.login}
              </p>
              <p>
                <strong>Nickname:</strong> {userMe.nickname}
              </p>
              <Link to={"/logout"}>Sair</Link>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="profile">
        <div className="flip-card">
          <div className="wrapper">
            <div className="card front">
              <center>
                <Avatar login={userOther.login} avatarUrl={userOther.avatarUrl} />
                <h1>{userOther.nickname}</h1>
              </center>
              <hr />
              <p>
                <strong>Nickname:</strong> {userOther.nickname}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
