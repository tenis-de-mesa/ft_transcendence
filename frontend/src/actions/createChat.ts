import { ActionFunctionArgs, redirect } from "react-router-dom";

export async function createChat({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userIds: number[] = formData.getAll("users[]").map((id) => Number(id));
  const message = formData.get("message");
  const url = "http://localhost:3001/chats";
  const body = {
    userIds,
    type: "direct",
    access: "private",
    message: message ? message : null,
  };
  const result = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const chat = await result.json();
  return redirect(`/chats/${chat.id}`);
}
