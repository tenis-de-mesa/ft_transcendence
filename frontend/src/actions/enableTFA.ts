import { ActionFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";

export async function enableTFA({ request }: ActionFunctionArgs) {
  console.log("enableTFA");
  const formData = await request.formData();

  const body = {
    tfaCode: formData.get("tfaCode"),
  };

  const { data, error } = await makeRequest<string[]>("/auth/tfa/enable", {
    method: request.method,
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
    message: "TFA enabled",
    recoveryCodes: data as string[],
  };
}
