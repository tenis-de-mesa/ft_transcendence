import { LoaderFunctionArgs, redirect } from "react-router-dom";

export async function redirectToChat({ params }: LoaderFunctionArgs) {
  const response = await fetch(
    `http://localhost:3001/chats/with/${params.id}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    return redirect(`/chats/new/${params.id}`);
  }
  const chat = await response.json();
  return redirect(`/chats/${chat.id}`);
}
