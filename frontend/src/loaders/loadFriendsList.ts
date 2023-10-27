export async function loadFriendsList() {
  console.log("loading friends list");
  return fetch(`http://localhost:3001/users/friends/`, {
    credentials: "include",
  });
}
