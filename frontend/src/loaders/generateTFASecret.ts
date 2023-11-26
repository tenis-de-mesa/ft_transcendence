import { makeRequest } from "../api";

export async function generateTFASecret() {
  const response = await makeRequest<{
    secret: string;
    qrCode: string;
  }>("/auth/tfa/generate", {
    method: "GET",
  });
  return response.data;
}
