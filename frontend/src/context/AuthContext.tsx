import { createContext, useEffect, useState } from "react";

type User = {
  login: string;
  tfaEnabled: boolean;
};

type AuthContextType = {
  user: User;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User>>;
};

export const AuthContext = createContext({} as AuthContextType);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const response: Response = await fetch(`http://localhost:3001/users/me`, {
        credentials: "include",
      });
      if (!response.ok) {
        setLoading(false);
        return null;
      }
      const user = await response.json();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
