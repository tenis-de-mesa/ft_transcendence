import { redirect } from "react-router-dom";

export async function loader({ request }: { request: Request }) {
  // If we don't have a code, redirect to intra login page
  return redirect("http://localhost:3001/auth/login")
}