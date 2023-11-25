import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function disableTFA({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const body = {
    tfaCode: formData.get("tfaCode"),
  };

  const response = await makeRequest<string[]>("/auth/tfa/disable", {
    method: request.method,
    body: JSON.stringify(body),
  });

  if (response.error) {
    return {
      status: "error",
      message: response.error.message,
    };
  }

  return {
    status: "success",
    message: "TFA disabled",
  };
}
