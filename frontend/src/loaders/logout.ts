import { redirect } from "react-router-dom";

export async function logout() {
  return redirect("https://transcendence.ngrok.app/api/auth/logout");
}
