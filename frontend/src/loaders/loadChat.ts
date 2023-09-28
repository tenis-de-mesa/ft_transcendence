import { LoaderFunctionArgs } from "react-router-dom";

export async function loadChat({ params }: LoaderFunctionArgs) {
  return fetch(`http://localhost:3001/chats/${params.id}`, {
    credentials: "include",
  });
}
