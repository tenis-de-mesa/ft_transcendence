import { Link, useLoaderData, useParams } from "react-router-dom";
import { User } from "../types/types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import { Avatar } from "../components/Avatar";
import { RootUser } from "./Root";
import { Card } from "../components/Card";

export default function Profile() {
  const { id } = useParams();

  const userId = Number(id);
  const currentUser = RootUser();
  const userOther = useLoaderData() as User; // loadUserById

  const flipCard = () => {
    const alternate = document.querySelector(".flip-card .wrapper");
    if (alternate) {
      alternate.classList.toggle("flipped");
    }
  };

  return !userId ? (
    <div className="profile">
      <div className="flip-card">
        <div className="wrapper">
          <Card className="card back">
            <UserForm user={currentUser} />
            <button onClick={flipCard} className="back-button">
              Voltar
            </button>
          </Card>
          <Card className="card front">
            <center>
              <Avatar seed={currentUser.login} src={currentUser.avatarUrl} />
              <h1>{currentUser.nickname}</h1>
              <button onClick={flipCard} className="edit-button">
                Editar
              </button>
            </center>
            <hr />
            <p>
              <strong>Login:</strong> {currentUser.login}
            </p>
            <p>
              <strong>Nickname:</strong> {currentUser.nickname}
            </p>
            <Link to={"/logout"}>Sair</Link>
          </Card>
        </div>
      </div>
    </div>
  ) : (
    <div className="profile">
      <div className="flip-card">
        <div className="wrapper">
          <div className="card front">
            <center>
              <Avatar seed={userOther.login} src={userOther.avatarUrl} />
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
  );
}
