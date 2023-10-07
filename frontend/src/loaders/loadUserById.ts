import { LoaderFunctionArgs } from "react-router-dom";

export async function loadUserById({ params }: LoaderFunctionArgs) {
  return fetch(`http://localhost:3001/users/${params.id}`, {
    credentials: "include",
  });
}
