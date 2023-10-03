import { Link } from "react-router-dom";
import { User } from "../types/types";
import "./Sidebar.css";

interface SidebarProps {
  user: User;
  sidebarOpen: boolean;
}

export default function Sidebar({ user, sidebarOpen }: SidebarProps) {
  return (
    <nav className={`sidebar ${sidebarOpen ? "" : "closed"}`}>
      <div className="spacer"></div>
      <Link to="/">Jogos</Link>
      <Link to="/chats">Chat</Link>
      <Link to="/users">Pessoas</Link>
      <Link to={`/profile/${user.id}`}>{user.nickname}</Link>
    </nav>
  );
}
