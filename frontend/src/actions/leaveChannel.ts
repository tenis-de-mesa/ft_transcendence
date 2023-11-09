export const leaveChannel = async (chatId: number) => {
  const url = `http://localhost:3001/chats/${chatId}/leave`;

  await fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    }
  });
};