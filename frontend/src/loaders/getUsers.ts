export async function getUsers() {
  return fetch(`http://localhost:3001/users/`);
}
