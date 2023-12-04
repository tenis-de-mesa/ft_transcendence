import { ActionFunctionArgs, redirect } from "react-router-dom";

export async function updateChat({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const currentPassword: string = formData.get("currentPassword") as string;
  const newPassword: string = formData.get("newPassword") as string;
  const chatAccess: string = formData.get("access") as string;
  const chatId = params.id;

  if (!chatId) {
    return console.error("Missing Chat ID");
  }

  if (chatAccess === "protected") {
    const verifyURL = `http://localhost:3001/chats/${chatId}/verify`;
    const verifyBody = { password: currentPassword };

    try {
      const response = await fetch(verifyURL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verifyBody),
      });

      if (!response.ok) {
        const { statusCode, error, message } = await response.json();
        console.error(`${statusCode} ${error}: ${message}`);
        return redirect(`/chats/${chatId}`);
      }
    } catch (error) {
      console.error(error);
      return redirect(`/chats/${chatId}`);
    }
  }

  const patchURL = `http://localhost:3001/chats/${chatId}`;
  const patchBody = {
    password: newPassword?.length ? newPassword : null,
    access: newPassword?.length ? "protected" : "public",
  };

  try {
    const response = await fetch(patchURL, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patchBody),
    });

    if (!response.ok) {
      const { statusCode, error, message } = await response.json();
      console.error(`${statusCode} ${error}: ${message}`);
      return redirect(`/chats/${chatId}`);
    }
  } catch (error) {
    console.error(error);
  }

  return redirect(`/chats/${chatId}`);
}
