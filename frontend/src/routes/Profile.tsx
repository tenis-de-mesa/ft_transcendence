import { Link, useLoaderData, useParams } from "react-router-dom";
import { User } from "../types/types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import { Avatar } from "../components/Avatar";
import { RootUser } from "./Root";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";
import UserUpdateAvatar from "../components/UserUpdateAvatar";

export default function Profile() {
  const currentUser = RootUser();
  const userOther = useLoaderData() as User; // loadUserById
  const isViewingOwnProfile = currentUser.id === userOther.id;

  const flipCard = () => {
    const alternate = document.querySelector(".flip-card .wrapper");
    if (alternate) {
      alternate.classList.toggle("flipped");
    }
  };

  return (
    <div className="profile h-full">
      <div className="flip-card grid">
        <div className="wrapper self-center">
          <Card className="card back">
            <Button
              variant="info"
              onClick={flipCard}
              className="absolute top-0 left-0 p-2"
            >
              Voltar
            </Button>
            <Card.Title>
              <UserUpdateAvatar user={userOther} />
            </Card.Title>
            <Card.Body position="left">
              <UserForm user={userOther} />
            </Card.Body>
          </Card>
          <Card className="card front">
            <Card.Title>
              <>
                <Avatar
                  seed={userOther.login}
                  src={userOther.avatarUrl}
                  className="inline"
                />
                <Typography customWeight="regular" variant="h4">
                  {userOther.nickname}
                </Typography>
                {isViewingOwnProfile && (
                  <Button
                    variant="info"
                    onClick={flipCard}
                    className="absolute top-0 right-0 p-2"
                  >
                    Editar
                  </Button>
                )}
              </>
            </Card.Title>
            <Card.Body>
              <Typography customWeight="regular" variant="md">
                <span className="flex justify-between">
                  <strong>Login:</strong>
                  {userOther.login}
                </span>
                <span className="flex justify-between">
                  <strong>Nickname:</strong>
                  {currentUser.nickname}
                </span>
              </Typography>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
