import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function sendChatMessage({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { id } = params;
  const { method } = request;
  const message = formData.get("message") as string;

  const conditions = [
    [!id, "Missing chat ID"],
    [!method, "Missing method"],
    [!message, "Missing message"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/chats/${id}/send-message`, {
    method,
    body: JSON.stringify({ message }),
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  return {
    status: "success",
    message: "Message sent successfully",
  };
}
