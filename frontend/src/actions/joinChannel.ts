export const joinChannel = async (chatId: number, password: string = undefined): Promise<boolean> => {
  let url: string;

  if (password) {
    url = `http://localhost:3001/chats/${chatId}/verify`;

    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: password }),
      });
      
      if (!response.ok) {
        return Promise.resolve(false);
      }
    } catch (error) {
      console.log(error);
      return Promise.resolve(false)
    }
  }

  url = `http://localhost:3001/chats/${chatId}/join`;

  await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    }
  });

  return Promise.resolve(true)
};