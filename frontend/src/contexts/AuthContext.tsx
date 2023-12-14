import { createContext, useEffect, useState } from "react";
import { User } from "../types";
import { socket } from "../socket";

type AuthContextType = {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
};

export const AuthContext = createContext({} as AuthContextType);

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response: Response = await fetch(
        `https://transcendence.ngrok.app/api/users/me`,
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        setIsLoading(false);
        return null;
      }
      const user = await response.json();
      console.log(user);
      setCurrentUser(user);
      setIsLoading(false);
    };

    if (currentUser == null) {
      fetchUser();
    }

    socket.on("currentUserData", (user: User) => {
      setCurrentUser(user);
    });
  }, [currentUser]);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
