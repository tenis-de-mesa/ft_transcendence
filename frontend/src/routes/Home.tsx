import "./Home.css";
import { RootUser } from "./Root";

export default function Home() {
  const user = RootUser();

  return (
    <div className="home">
      <div className="card">
        <h1>Welcome {user.nickname}</h1>
      </div>
    </div>
  );
}
