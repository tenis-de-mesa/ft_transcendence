import { ActionFunctionArgs, redirect } from "react-router-dom";

export async function changeChatPassword({
  request,
  params,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const currentPassword: string = formData.get("currentPassword") as string;
  const newPassword: string = formData.get("newPassword") as string;
  const confirmPassword: string = formData.get("confirmPassword") as string;
  const chatId = params.id;

  const body = {
    currentPassword,
    newPassword,
    confirmPassword,
  };

  if (!chatId) {
    return console.error("Missing Chat ID");
  }

  const url = `http://localhost:3001/chats/${chatId}/change-password`;

  try {
    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const { statusCode, error, message } = await response.json();
      console.error(`${statusCode} ${error}: ${message}`);
    }
  } catch (error) {
    console.error(error);
  }

  return redirect(`/chats/${chatId}`);
}
