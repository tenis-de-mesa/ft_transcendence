import { Link, useRouteError } from "react-router-dom";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";
import classNames from "classnames";
import { isDark } from "./Root";

export default function ErrorBoundary() {
  const error: Response = useRouteError() as Response;

  console.error("ErrorBoundary: ", error);

  const status = error?.status ?? "?";
  const statusText = error?.statusText ?? "Internal Error";

  return (
    <>
      <div
        className={classNames("w-screen h-screen", "overflow-hidden", {
          dark: isDark,
        })}
      >
        <div className="grid h-screen place-content-center text-center bg-gray-300 dark:bg-gray-700">
          <Typography customWeight="regular" variant="h1">
            {status}
          </Typography>
          <Typography customWeight="regular" variant="h4">
            {statusText}
          </Typography>
          <br></br>
          <Link to={"/"} className="flex justify-center">
            <Button size="md" variant="info">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
