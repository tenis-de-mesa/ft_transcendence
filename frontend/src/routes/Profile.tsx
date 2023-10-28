import { Link, useLoaderData } from "react-router-dom";
import { User } from "../types/types";
import UserForm from "../components/UserForm";

import "./Profile.css";
import { Avatar } from "../components/Avatar";
import { RootUser } from "./Root";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";
import UserUpdateAvatar from "../components/UserUpdateAvatar";
import { AddFriendButton } from "../components/AddFriendButton";
import { BsFillChatDotsFill } from "react-icons/bs";

export default function Profile() {
  const currentUser = RootUser();
  const profileUser = useLoaderData() as User; // loadUserById
  const isViewingOwnProfile = currentUser.id === profileUser.id;

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
          <Card className="card front">
            <Card.Title>
              <>
                <Avatar
                  seed={profileUser.login}
                  src={profileUser.avatarUrl}
                  className="inline"
                />
                <Typography customWeight="regular" variant="h4">
                  {profileUser.nickname}
                </Typography>
                {isViewingOwnProfile && (
                  <Button
                    variant="info"
                    onClick={flipCard}
                    className="absolute top-0 right-0 p-2 shadow-none"
                  >
                    Editar
                  </Button>
                )}
              </>
            </Card.Title>
            <Card.Body>
              <>
                <Typography customWeight="regular" variant="md">
                  <span className="flex justify-between">
                    <strong>Login:</strong>
                    {profileUser.login}
                  </span>
                  <span className="flex justify-between">
                    <strong>Nickname:</strong>
                    {profileUser.nickname}
                  </span>
                </Typography>
                <div className="flex flex-col gap-2 p-2 mt-2">
                  <AddFriendButton user={profileUser} />

                  <Link to={`/chats/with/${profileUser.id}`} className="grid">
                    <Button
                      variant="info"
                      size="sm"
                      LeadingIcon={<BsFillChatDotsFill />}
                    >
                      Chat
                    </Button>
                  </Link>
                </div>
              </>
            </Card.Body>
          </Card>
          <Card className="card back">
            <Button
              variant="info"
              onClick={flipCard}
              className="absolute top-0 left-0 p-2 shadow-none"
            >
              Voltar
            </Button>
            <Card.Title>
              <UserUpdateAvatar user={profileUser} />
            </Card.Title>
            <Card.Body position="left">
              <UserForm user={profileUser} />
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
