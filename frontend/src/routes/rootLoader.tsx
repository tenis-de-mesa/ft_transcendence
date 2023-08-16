export default async function rootLoader() {
  try {
    const response: Response = await fetch(
      `${process.env.BACKEND_HOSTNAME}/users/me`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      return null;
    }
    return response;
  } catch (error) {
    console.error(error);
    return null;
  }
}
