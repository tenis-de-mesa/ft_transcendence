import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function blockUser({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id");
  const { method } = request;

  const conditions = [
    [!method, "Missing form method"],
    [!id, "Missing ID of user to block"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/users/${id}/block`, {
    method,
  });

  if (error) {
    return {
      status: "error",
      message: error.message,
    };
  }

  return {
    status: "success",
    message: `User blocked successfully`,
  };
}
