import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";
import { User } from "../types/types";

import Login from "../components/Login";

import { Sidebar } from "../components/nav/Sidebar";
import { navitems } from "../data";
import classNames from "classnames";

const isDark = true;

export default function Root() {
  const user: User = useLoaderData() as User;

  if (!user) {
    return (
      <div className={isDark ? "dark " : ""}>
        <div className={classNames(
          "center",
          "bg-white dark:bg-gray-700",
        )}>
          <Login />
        </div>
      </div>
    )
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="flex gap-5 bg-white dark:bg-gray-700">
        <Sidebar darkMode={isDark} options={navitems} user={user} />
        <main className="flex-1 max-h-screen py-4 mx-auto">
          <Outlet context={user} />
        </main>
      </div>
    </div>
  );
}

export function RootUser(): User {
  return useOutletContext();
}