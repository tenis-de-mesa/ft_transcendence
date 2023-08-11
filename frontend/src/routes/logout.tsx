import { redirect } from "react-router-dom";

export async function loader() {
  document.cookie = "Bearer=" + "; path=/";
  return redirect("/");
}