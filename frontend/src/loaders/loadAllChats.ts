import { makeRequest } from "../api";
import { Chat } from "../types";

export async function loadAllChats() {
  const { data, error } = await makeRequest<Chat[]>(`/chats/all`, {
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
