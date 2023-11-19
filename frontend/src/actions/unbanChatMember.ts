import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function unbanChatMember({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;

  const body = {
    unbanUserId: Number(formData.get("unbanUserId")),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.unbanUserId, "Missing user ID"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/unban`, {
    method,
    body: JSON.stringify(body),
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  return {
    status: "success",
    message: "User unbanned successfully",
  };
}
