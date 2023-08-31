import { useLoaderData } from "react-router-dom";
import { socket } from "../../socket";
import { useEffect, useState } from "react";

type User = {
  id: number;
  login: string;
  status: "online" | "offline";
};

type UserStatus = {
  id: number;
  status: "online" | "offline";
};

export default function Users() {
  const initialUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    socket.on("userStatus", (data: UserStatus) => {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === data.id ? { ...user, status: data.status } : user
        )
      );
    });
  }, []);

  return (
    <div>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <span>{user.login} </span>
            <span style={{ color: user.status === "online" ? "green" : "red" }}>
              {user.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
