import { ActionFunctionArgs, redirect } from "react-router-dom";

export async function createChannel({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userIds: number[] = formData.getAll("users[]").map((id) => Number(id));
  const password: string = formData.get("password") as string;
  const url = "http://localhost:3001/chats";
  const body = {
    userIds,
    type: "channel",
    password: password ?? undefined,
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
