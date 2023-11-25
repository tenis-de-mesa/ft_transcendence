import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

interface ManageChannelPasswordBody {
  newPassword?: string;
  confirmPassword?: string;
  currentPassword?: string;
}

async function handleChannelPassword(
  id: string,
  method: string,
  body: ManageChannelPasswordBody,
  successMessage: string
) {
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
    message: successMessage,
  };
}

export async function manageChannelPassword({
  request,
  params,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { id } = params;
  const { method } = request;

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!intent, "Missing intent"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  switch (intent) {
    case "set":
      return await handleChannelPassword(
        id,
        method,
        {
          newPassword: formData.get("newPassword") as string,
          confirmPassword: formData.get("confirmPassword") as string,
        },
        "Password set successfully"
      );

    case "change":
      return await handleChannelPassword(
        id,
        method,
        {
          currentPassword: formData.get("currentPassword") as string,
          newPassword: formData.get("newPassword") as string,
          confirmPassword: formData.get("confirmPassword") as string,
        },
        "Password changed successfully"
      );

    case "remove":
      return await handleChannelPassword(
        id,
        method,
        {
          currentPassword: formData.get("currentPassword") as string,
        },
        "Password removed successfully"
      );

    default:
      return {
        status: "error",
        message: "Invalid intent",
      };
  }
}
