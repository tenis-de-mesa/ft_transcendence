import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function unmuteChatMember({
  request,
  params,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;

  const body = {
    unmuteUserId: Number(formData.get("unmuteUserId")),
  };

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing form method"],
    [!body.unmuteUserId, "Missing user ID"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/unmute`, {
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
    message: "User unmuted successfully",
  };
}
