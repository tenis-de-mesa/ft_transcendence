import { LoaderFunctionArgs, redirect } from "react-router-dom";

export async function login({ params }: LoaderFunctionArgs) {
  return redirect(`http://localhost:3001/auth/login/${params.provider}`);
}
