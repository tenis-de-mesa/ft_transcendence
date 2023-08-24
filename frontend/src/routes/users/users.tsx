import { useLoaderData } from "react-router-dom";

interface User {
  id: number;
  login: string;
}

export default function Users() {
  const users: User[] = useLoaderData() as User[];
  return (
    <>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.login}</li>
        ))}
      </ul>
    </>
  );
}