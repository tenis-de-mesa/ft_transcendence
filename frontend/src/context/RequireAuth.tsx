import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthContext from "./AuthContext";

const RequireAuth = () => {
  const { user, loading } = useContext(AuthContext);

  console.log("CURRENTLY LOADED USER:");
  console.log(user);

  console.log("IS LOADING?");
  console.log(loading);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default RequireAuth;
