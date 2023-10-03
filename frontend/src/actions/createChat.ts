import { ActionFunctionArgs } from "react-router-dom";

export async function createChat({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const userId = formData.get("user") as string;
  const url = "http://localhost:3001/chats";
  const body = {
    userIds: [userId],
  };

  return fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}
