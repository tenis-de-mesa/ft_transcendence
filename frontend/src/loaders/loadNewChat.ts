import { LoaderFunctionArgs, redirect } from "react-router-dom";
import { makeRequest } from "../api";
import { Chat } from "../types";
import { loadUserById } from ".";

export async function loadNewChat({ request, params }: LoaderFunctionArgs) {
  const { userId } = params;

  const { data, error } = await makeRequest<Chat>(`/chats/with/${userId}`, {
    method: "GET",
  });

  if (!error) {
    return redirect(`/chats/${data.id}`);
  }

  return loadUserById({ request, params });
}
