export async function loadChatList() {
  return fetch(`http://localhost:3001/chats`, {
    credentials: "include",
  });
}
