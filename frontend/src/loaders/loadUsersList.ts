export async function loadUsersList() {
  console.log("loadUsersList");
  return fetch(`http://localhost:3001/users/`, {
    credentials: "include",
  });
}
