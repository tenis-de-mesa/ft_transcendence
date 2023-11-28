import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "../components/Button";
import { Typography } from "../components/Typography";
import classNames from "classnames";
import { isDark } from "./Root";

export default function ErrorBoundary() {
  const error = useRouteError();

  // FIXME: Remove this log
  console.error("ErrorBoundary: ", error);

  let status = 500;
  let statusText: string;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    statusText = error.statusText;
  } else if (error instanceof Error) {
    statusText = error.message;
  } else if (typeof error === "string") {
    statusText = error;
  } else {
    status = 404;
    statusText = "Not Found";
  }

  return (
    <>
      <div
        className={classNames("w-screen h-screen", "overflow-hidden", {
          dark: isDark,
        })}
      >
        <div className="grid h-screen place-content-center text-center space-y-2 bg-gray-300 dark:bg-gray-700">
          <Typography variant="h1">{status}</Typography>
          <Typography variant="h4">{statusText}</Typography>
          <Link to="/" className="flex">
            <Button size="md" variant="info" className="w-full justify-center">
              Home
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
