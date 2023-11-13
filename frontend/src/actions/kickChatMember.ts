import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function kickChatMember({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;
  const body = {
    kickUserId: formData.get("userId"),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.kickUserId, "Missing user ID"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/kick`, {
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
    message: "User kicked successfully",
  };
}
