import { useLoaderData, useOutlet } from "react-router-dom";
import { User } from "../types/types";

import Home from "./Home";
import Login from "../components/Login";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

import "./Root.css";

export default function Root() {
  const outlet = useOutlet();
  const user = useLoaderData() as User;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <Login />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`container ${sidebarOpen ? "" : "closed"}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ≡
      </button>
      <Sidebar user={user} sidebarOpen={sidebarOpen}></Sidebar>
      {outlet || <Home user={user} />}
    </div>
  );
}
