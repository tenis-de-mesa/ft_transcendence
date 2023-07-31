import { isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  const msg = isRouteErrorResponse(error) ? (
    <p>
      {error.status} {error.statusText}
    </p>
  ) : (
    <></>
  );

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>
        <i>{msg}</i>
      </p>
    </div>
  );
}
