import { redirect } from "react-router-dom";

export const joinChannel = async (chatId: number) => {
  const url = `http://localhost:3001/chats/${chatId}/join`;

  await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    }
  });

  return redirect(`/chats/${chatId}`);
};