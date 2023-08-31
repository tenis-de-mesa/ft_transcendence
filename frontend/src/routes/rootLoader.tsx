export default async function rootLoader() {
  const response: Response = await fetch(
    `http://localhost:3001/users/me`,
    {
      credentials: "include",
    },
  );
  if (!response.ok) {
    return null;
  }
  return response;
}
