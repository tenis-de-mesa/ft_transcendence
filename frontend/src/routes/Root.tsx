import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";
import { User } from "../types/types";

import Login from "../components/Login";

import "./Root.css";
import { Sidebar } from "../components/nav/Sidebar";
import { navitems } from "../data";

export default function Root() {
  const user: User = useLoaderData() as User;

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex gap-5">
      <Sidebar options={navitems} user={user} />
      <main className="flex-1 py-4 mx-auto">
        <Outlet context={user} />
      </main>
    </div>

  );
}

export function RootUser(): User {
  return useOutletContext();
}