import classNames from "classnames";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/nav/Sidebar";
import { navitems as navitemsTemplate } from "../data";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";

export const isDark = true;

export default function Root() {
  const { currentUser } = useContext(AuthContext);

  // On the navitem with label profile, append the user id to the path
  const navitems = navitemsTemplate.map((navitem) => {
    if (navitem.label === "Profile") {
      return { ...navitem, path: `${navitem.path}/${currentUser.id}` };
    }
    return navitem;
  });

  return (
    <div
      className={classNames("w-screen h-screen", "overflow-hidden", {
        dark: isDark,
      })}
    >
      <div className="flex w-full h-full bg-white dark:bg-gray-700">
        <div className="">
          <Sidebar darkMode={isDark} options={navitems} user={currentUser} />
        </div>
        <div className="w-[calc(100%-16rem)] h-[calc(100%-2rem)] px-3 m-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
