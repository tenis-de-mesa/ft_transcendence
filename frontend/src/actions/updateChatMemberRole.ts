import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function updateChatMemberRole({
  request,
  params,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;

  const body = {
    updateUserId: Number(formData.get("updateUserId")),
    role: formData.get("role"),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.updateUserId, "Missing user ID"],
    [!body.role, "Missing role"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/update-member-role`, {
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
    message: "User role updated successfully",
  };
}
