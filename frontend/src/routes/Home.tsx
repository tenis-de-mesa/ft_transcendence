import { User } from "../types/types";

import "./Home.css";
interface HomeProps {
  user: User;
}

export default function Home({ user }: HomeProps) {
  return (
    <div className="home">
      <div className="card">
        <h1>Welcome {user.nickname}</h1>
      </div>
    </div>
  );
}
