import { LoaderFunctionArgs, redirect } from "react-router-dom";

export async function providerLogin({ params }: LoaderFunctionArgs) {
  return redirect(
    `https://transcendence.ngrok.app/api/auth/login/${params.provider}`
  );
}
