export async function loadFriendsList() {
  return fetch(`http://localhost:3001/users/friends/`, {
    credentials: "include",
  });
}
