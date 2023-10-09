import { createBrowserRouter } from "react-router-dom";

import {
  loadRootUser,
  loadUsersList,
  loadChatList,
  loadChat,
  login,
  logout,
} from "./loaders";

import { createChat } from "./actions";

// Routes
import Root from "./routes/Root.tsx";
import Users from "./routes/Users.tsx";
import Profile from "./routes/Profile.tsx";
import Chats from "./routes/Chats.tsx";
import Chat from "./routes/Chat.tsx";
import Home from "./routes/Home.tsx";
import { sendChatMessage } from "./actions/sendChatMessage.ts";
import Leaderboard from "./routes/Leaderboard.tsx";
import Games from "./routes/Games.tsx";
import Settings from "./routes/Settings.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <Root />,
    loader: loadRootUser,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "users",
        element: <Users />,
        loader: loadUsersList,
      },
      {
        path: "chats",
        element: <Chats />,
        loader: loadChatList,
        action: createChat,
        children: [
          {
            path: ":id",
            element: <Chat />,
            loader: loadChat,
            action: sendChatMessage,
          },
        ],
      },
      {
        path: "profile/:id?",
        element: <Profile />,
      },
      {
        path: "leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "games",
        element: <Games />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/login/:provider",
    loader: login,
  },
  {
    path: "/logout",
    loader: logout,
  },
]);

export default router;
