import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function removeChannelPassword({
  request,
  params,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;

  const body = {
    currentPassword: formData.get("currentPassword"),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.currentPassword, "Missing current password"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/change-password`, {
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
    message: "Password removed successfully",
  };
}
