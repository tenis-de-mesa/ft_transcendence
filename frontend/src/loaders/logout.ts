import { redirect } from "react-router-dom";

export async function logout() {
  return redirect("http://localhost:3001/auth/logout");
}
