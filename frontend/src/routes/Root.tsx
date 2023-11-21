import classNames from "classnames";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/nav/Sidebar";
import { navitems as navitemsTemplate } from "../data";
import { useContext } from "react";
import { AuthContext } from "../contexts";

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
          <Sidebar darkMode={isDark} options={navitems} />
        </div>
        <div className="w-full h-full py-3 px-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
