import classNames from "classnames";
import { Outlet, useNavigate } from "react-router-dom";
import { Sidebar } from "../components/nav/Sidebar";
import { navitems as navitemsTemplate } from "../data";
import { useContext } from "react";
import { AuthContext } from "../contexts";
import { Toaster } from "sonner";
import { useWebSocket } from "../hooks";
import { toast } from "sonner";
import { User } from "../types";

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
          <Toaster
            theme="dark"
            duration={6000}
            toastOptions={{
              className: "my-toast",
            }}
          />
          <SocketListener />
        </div>
      </div>
    </div>
  );
}

function SocketListener() {
  const socket = useWebSocket();
  const navigate = useNavigate();

  socket.on("newGameInvite", (user: User) => {
    console.log("newGameInvite", user);
    toast(`${user.nickname} invited you to play a game`, {
      action: {
        label: "View invites",
        onClick: () => navigate("/games"),
      },
    });
  });

  socket.on("gameAvailable", (gameId) => {
    console.log("gameAvailable", gameId);
    navigate(`/games/${gameId}`);
  });
  return null;
}
