import { redirect } from "react-router-dom";

export async function loader() {
  return redirect("http://localhost:3001/auth/logout");
}
