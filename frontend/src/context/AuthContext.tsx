import { createContext, useEffect, useState } from "react";
import { User } from "../types/types";

type AuthContextType = {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export const AuthContext = createContext({} as AuthContextType);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response: Response = await fetch(`http://localhost:3001/users/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        setIsLoading(false);
        return null;
      }
      const user = await response.json();
      setUser(user);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
