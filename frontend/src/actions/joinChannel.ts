export const joinChannel = async (chatId: number) => {
  const url = `http://localhost:3001/chats/${chatId}/join`;

  await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    }
  });
};