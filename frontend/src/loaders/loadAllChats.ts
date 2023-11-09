export async function loadAllChats() {
  return fetch(`http://localhost:3001/chats/all`, {
    credentials: "include",
  });
}
