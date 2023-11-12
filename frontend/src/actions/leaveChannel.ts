import { ActionFunctionArgs, redirect } from "react-router-dom";
import { makeRequest } from "../api";

export async function leaveChannel({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();

  const { id } = params;
  const { method } = request;
  const body = {
    newOwnerId: formData.get("new-owner-id"),
  };

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

  const { error } = await makeRequest(`/chats/${id}/leave`, {
    method,
    body: JSON.stringify(body),
  });

  if (error) {
    return {
      message: error.message,
    };
  }

  return redirect(`/channels`);
}
