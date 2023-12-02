import { makeRequest } from "../api";
import { User } from "../types";

export async function loadUsersList() {
  const { data, error } = await makeRequest<User[]>(`/users`, {
    method: "GET",
  });

  if (error) {
    throw new Response(error.message, {
      status: error.statusCode,
      statusText: error.message,
    });
  }

  return data;
}
