import { Typography } from "../components/Typography";
import { RootUser } from "./Root";

export default function Home() {
  const user = RootUser();

  return (
    <div className="flex justify-center h-full">
      <Typography variant="h3">Welcome {user.nickname}</Typography>
    </div>
  );
}
