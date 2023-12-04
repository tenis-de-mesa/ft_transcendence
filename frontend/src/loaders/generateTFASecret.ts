import { makeRequest } from "../api";

export async function generateTFASecret() {
  const { data } = await makeRequest<{
    secret: string;
    qrCode: string;
  }>("/auth/tfa/generate", {
    method: "GET",
  });

  return data;
}
