export default async function rootLoader() {
  const response: Response = await fetch(
    `${process.env.BACKEND_HOSTNAME}/users/me`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    return null;
  }
  return response;
}
