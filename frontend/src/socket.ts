import { io } from "socket.io-client";
const URL = "http://localhost:3001";

const response: Response = await fetch(`${URL}/users/me`, {
  credentials: "include",
});
const user = await response.json();
export const socket = io(URL, {
  auth: { user },
  withCredentials: true,
});
