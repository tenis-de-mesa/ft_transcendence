import { makeRequest } from "../api";
import { Chat } from "../types";

export async function loadChatList() {
  const { data, error } = await makeRequest<Chat[]>(`/chats`, {
    method: "GET",
  });

  if (error) {
    throw new Response(error.message, {
      status: error.statusCode,
      statusText: error.message,
    });
  }

  return data;
}
