import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { makeRequest } from "../api";
import { Chat } from "../types";

export async function redirectToChat({ params }: LoaderFunctionArgs) {
  const { data, error } = await makeRequest<Chat>(
    `/chats/with/${params.userId}`,
    { method: "GET" }
  );

  if (error) {
    return redirect(`/chats/new/${params.userId}`);
  }

  return redirect(`/chats/${data.id}`);
}
