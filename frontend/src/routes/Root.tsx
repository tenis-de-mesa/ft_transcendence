import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";
import { User } from "../types/types";

import Login from "../components/Login";
import Sidebar from "../components/Sidebar";
import { useState } from "react";

import "./Root.css";

export default function Root() {
  const user: User = useLoaderData() as User;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user) {
    return <Login />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className={`main-content ${sidebarOpen ? "" : "closed"}`}>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ≡
      </button>
      <Sidebar user={user} sidebarOpen={sidebarOpen}></Sidebar>
      <Outlet context={user} />
    </div>
  );
}

export function RootUser(): User {
  return useOutletContext();
}
