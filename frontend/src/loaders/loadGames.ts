import { makeRequest } from "../api";
import { Game } from "../types";

export async function loadGames() {
  const { data, error } = await makeRequest<Game>("/games", {
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
