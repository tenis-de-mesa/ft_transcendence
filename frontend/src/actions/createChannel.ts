import { ActionFunctionArgs, redirect } from "react-router-dom";
import { makeRequest } from "../api";
import { Chat } from "../types";

export async function createChannel({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { method } = request;

  const body = {
    userIds: formData.getAll("userId").map((id) => Number(id)),
    password: (formData.get("password") as string) ?? undefined,
    access: formData.get("access") as string,
    type: "channel",
  };

  const conditions = [
    [!method, "Missing form method"],
    [!body.access, "Missing chat access"],
    [body.access === "protected" && !body.password, "Missing chat password"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { data, error } = await makeRequest<Chat>("/chats", {
    method,
    body: JSON.stringify(body),
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  return redirect(`/chats/${data.id}`);
}
