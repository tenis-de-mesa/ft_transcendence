import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function blockOrUnblockUser({
  request,
  params,
}: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");
  const { id } = params;
  const { method } = request;

  console.log({ params, request });

  const conditions = [
    [!method, "Missing form method"],
    [!id, "Missing ID of user to block"],
    [!intent, "Missing intent"],
  ];

  const fail = conditions.find(([condition]) => condition);

  if (fail) {
    return {
      status: "error",
      message: fail[1] as string,
    };
  }

  const { error } = await makeRequest(`/users/${id}/${intent}`, {
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
    message: `User ${intent}ed successfully`,
  };
}
