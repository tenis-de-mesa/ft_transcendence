import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "./AuthContext";

const RequireAuth = () => {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default RequireAuth;
