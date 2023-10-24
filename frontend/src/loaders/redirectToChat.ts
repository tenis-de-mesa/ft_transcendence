import { LoaderFunctionArgs, redirect } from "react-router-dom";

export async function redirectToChat({ params }: LoaderFunctionArgs) {
  const response = await fetch(
    `http://localhost:3001/chats/with/${params.userId}`,
    {
      credentials: "include",
    }
  );
  if (!response.ok) {
    return redirect(`/chats/new/${params.userId}`);
  }
  const chat = await response.json();
  return redirect(`/chats/${chat.id}`);
}
