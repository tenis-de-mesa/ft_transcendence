import { INavitem } from "../@interfaces";

import {
  LuBarChart2,
  LuGlobe,
  LuHome,
  LuMessagesSquare,
  LuSettings,
  LuUser,
  LuUsers,
} from "react-icons/lu";

export const navitems: INavitem[] = [
  {
    order: 0,
    path: "/",
    label: "Home",
    icon: <LuHome />,
  },
  {
    order: 1,
    path: "profile",
    label: "Profile",
    icon: <LuUser />,
  },
  {
    order: 2,
    path: "users",
    label: "All users",
    icon: <LuUsers />,
  },
  {
    order: 2,
    path: "friends",
    label: "Friends",
    icon: <LuUsers />,
  },
  {
    order: 3,
    path: "leaderboard",
    label: "Leaderboard",
    icon: <LuBarChart2 />,
  },
  {
    order: 4,
    path: "games",
    label: "Games",
    icon: <LuGlobe />,
  },
  {
    order: 5,
    path: "chats",
    label: "Chats",
    icon: <LuMessagesSquare />,
  },
  {
    order: 6,
    path: "settings",
    label: "Settings",
    icon: <LuSettings />,
  },
];
