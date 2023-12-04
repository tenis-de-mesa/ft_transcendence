import { LoaderFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";
import { Chat } from "../types";

export async function loadChat({ params }: LoaderFunctionArgs) {
  const { data, error } = await makeRequest<Chat>(`/chats/${params.id}`, {
    method: "GET",
  });

  if (error) {
    if (error.statusCode === 401) {
      throw new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }

    throw new Response(error.message, {
      status: error.statusCode,
      statusText: error.message,
    });
  }

  return data;
}
