import { redirect } from "react-router-dom";

async function getTokenFromCode(code: string): Promise<string> {
  const endpoint = `${process.env.BACKEND_HOSTNAME}/auth/login`;
  const response = await fetch(`${endpoint}?code=${code}`);
  const data = await response.json();
  return data.access_token;
}

function getIntraLoginUrl(): string {
  const urlBase = process.env.INTRA_AUTH_URL!;
  const clientId = process.env.INTRA_CLIENT_ID!;
  const redirectUri = process.env.INTRA_REDIRECT_URI!;
  const responseType = "code";

  debugger;

  const loginUrl = new URL(urlBase);
  loginUrl.searchParams.append("client_id", clientId);
  loginUrl.searchParams.append("redirect_uri", redirectUri);
  loginUrl.searchParams.append("response_type", responseType);

  return loginUrl.toString();
}

export async function loader({ request }: { request: Request }) {
  const params = new URLSearchParams(request.url.split("?")[1]);
  const code = params.get("code");

  // If there is a code, we are in the callback
  if (code) {
    const token = await getTokenFromCode(code);
    document.cookie = `Bearer=${token}; path=/`;
    return redirect("/")
  } 

  // If we don't have a code, redirect to intra login page
  const intraLoginUrl = getIntraLoginUrl();
  return redirect(intraLoginUrl)
}