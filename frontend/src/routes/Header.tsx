import { Link } from "react-router-dom";
import { User } from "../types/types";
import "./Header.css";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="header">
      <Link to={"/"} style={{ textDecoration: "none" }}>
        🐱 🐱 🐱
      </Link>
      {user && <Link to={"/"}>{user.nickname}</Link>}
    </header>
  );
}
