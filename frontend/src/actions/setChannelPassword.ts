import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function setChannelPassword({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;

  const body = {
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.newPassword, "Missing new password"],
    [!body.confirmPassword, "Missing password confirmation"],
    [body.newPassword !== body.confirmPassword, "Passwords do not match"],
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
    message: "Password changed successfully",
  };
}
