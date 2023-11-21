import { LoaderFunctionArgs } from "react-router-dom";

export async function loadGame({ params }: LoaderFunctionArgs) {
  return fetch(`http://localhost:3001/games/${params.id}`, {
    credentials: "include",
  });
}
