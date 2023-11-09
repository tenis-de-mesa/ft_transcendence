import { Link } from "react-router-dom";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Button } from "../components/Button";
import { images } from "../data/images";
import { FaUserSecret } from "react-icons/fa";
import classNames from "classnames";

export default function Login() {
  return (
    <div
      className={classNames("w-screen h-screen", "overflow-hidden", {
        dark: true,
      })}
    >
      <div className={classNames("center", "bg-white dark:bg-gray-700")}>
        <Card className="bg-gray-100 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800">
          <Card.Title>
            <Typography variant="h6">Transcendence</Typography>
          </Card.Title>
          <Card.Body className="flex flex-col gap-2 pt-0 pb-6">
            <div className="flex flex-col gap-1">
              <Link to={"/login/intra"}>
                <Button
                  variant="info"
                  LeadingIcon={<img src={images.logoLight} width={20} />}
                  className="w-full"
                >
                  <Typography variant="md">Login with 42</Typography>
                </Button>
              </Link>
              <Link to={"/login/guest"}>
                <Button
                  variant="info"
                  LeadingIcon={<FaUserSecret size={20} />}
                  className="w-full"
                >
                  <Typography variant="md">Play anonymously</Typography>
                </Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
