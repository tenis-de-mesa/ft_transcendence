import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function muteChatMember({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;

  const body = {
    muteUserId: Number(formData.get("userId")),
    muteDuration: Number(formData.get("muteDuration")),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.muteUserId, "Missing user ID"],
    [!body.muteDuration, "Missing mute duration"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/mute`, {
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
    message: "User muted successfully",
  };
}
