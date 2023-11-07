import { useContext } from "react";
import { Typography } from "../components/Typography";
import AuthContext from "../context/AuthContext";

export default function Home() {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="flex justify-start h-full p-5">
      <Typography variant="h5">Welcome, {currentUser.nickname} !</Typography>
    </div>
  );
}
