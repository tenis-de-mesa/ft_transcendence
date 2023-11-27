import { ActionFunctionArgs, redirect } from "react-router-dom";
import { makeRequest } from "../api";

export async function deleteChat({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  const { method } = request;

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/delete`, {
    method,
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  return redirect(`/chats`);
}
