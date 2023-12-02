import { LoaderFunctionArgs } from "react-router-dom";
import { makeRequest } from "../api";
import { User } from "../types";

export async function loadUserById({ params }: LoaderFunctionArgs) {
  const { userId } = params;

  const { data, error } = await makeRequest<User>(`/users/${userId}`, {
    method: "GET",
  });

  if (error) {
    if (error.statusCode === 401) {
      throw new Response("Not Found", {
        status: 404,
        statusText: "Not Found",
      });
    }

    throw new Response(error.message, {
      status: error.statusCode,
      statusText: error.message,
    });
  }

  return data;
}
