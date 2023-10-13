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
    <div className={classNames(
      "w-screen h-screen",
      "overflow-hidden", {
        "dark": isDark
      }
    )}>
      <div className="flex w-full h-full bg-white dark:bg-gray-700">
        <div className="">
          <Sidebar darkMode={isDark} options={navitems} user={user} />
        </div>
        <div className="w-[calc(100%-16rem)] h-[calc(100%-2rem)] px-3 m-auto">
          <Outlet context={user} />
        </div>
      </div>
    </div>
  );
}

export function RootUser(): User {
  return useOutletContext();
}