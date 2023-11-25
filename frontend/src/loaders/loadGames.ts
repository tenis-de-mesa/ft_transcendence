export async function loadGames() {
  return fetch(`http://localhost:3001/games/`, {
    credentials: "include",
  });
}
