export async function loadUsersList() {
  return fetch(`http://localhost:3001/users/`);
}
