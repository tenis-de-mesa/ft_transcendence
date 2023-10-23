import { Typography } from "../components/Typography";
import { RootUser } from "./Root";

export default function Home() {
  const user = RootUser();

  return (
    <div className="flex justify-start h-full p-5">
      <Typography variant="h5">Welcome, {user.nickname} !</Typography>
    </div>
  );
}
