import { Outlet, useLoaderData, useOutletContext } from "react-router-dom";

import classNames from "classnames";
import { Sidebar } from "../components/nav/Sidebar";
import { navitems } from "../data";

import { User } from "../types/types";
import Login from "./Login";

export const isDark = true;

export default function Root() {
  const user: User = useLoaderData() as User;

  return (
    <div
      className={classNames("w-screen h-screen", "overflow-hidden", {
        dark: isDark,
      })}
    >
      {!user ? (
        <div className={classNames("center", "bg-white dark:bg-gray-700")}>
          <Login />
        </div>
      ) : (
        <div className="flex w-full h-full bg-white dark:bg-gray-700">
          <div className="">
            <Sidebar darkMode={isDark} options={navitems} user={user} />
          </div>
          <div className="w-[calc(100%-16rem)] h-[calc(100%-2rem)] px-3 m-auto">
            <Outlet context={user} />
          </div>
        </div>
      )}
    </div>
  );
}

export function RootUser(): User {
  return useOutletContext();
}
