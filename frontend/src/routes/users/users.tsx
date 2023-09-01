import { useLoaderData } from "react-router-dom";
import { socket } from "../../socket";
import { useEffect, useState } from "react";
import { User, UserStatus } from "../../types/types";

export default function Users() {
  const initialUsers: User[] = useLoaderData() as User[];
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    // Listen for user status updates from the server
    socket.on("userStatus", (data: UserStatus) => {
      // Update the status of the user in the local state
      setUsers((prevUsers) =>
        prevUsers.map((user) => {
          // If the user is the one whose status has been updated, change their status
          if (user.id === data.id) {
            return { ...user, status: data.status };
          }
          // Otherwise, return the user as is
          return user;
        }),
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
