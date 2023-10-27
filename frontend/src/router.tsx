import { createBrowserRouter } from "react-router-dom";

import {
  loadRootUser,
  loadUsersList,
  loadChatList,
  loadChat,
  login,
  logout,
  loadFriendsList,
} from "./loaders";

import { createChannel, createChat } from "./actions";

// Routes
import Root from "./routes/Root.tsx";
import Users from "./routes/Users.tsx";
import Profile from "./routes/Profile.tsx";
import Chats from "./routes/Chats.tsx";
import Chat from "./routes/Chat.tsx";
import Home from "./routes/Home.tsx";
import ChatNew from "./routes/ChatNew.tsx";
import { sendChatMessage } from "./actions/sendChatMessage.ts";
import { loadUserById } from "./loaders/loadUserById.ts";
import Leaderboard from "./routes/Leaderboard.tsx";
import Games from "./routes/Games.tsx";
import Settings from "./routes/Settings.tsx";
import { redirectToChat } from "./loaders/redirectToChat.ts";
import ErrorBoundary from "./routes/ErrorBoundary.tsx";
import Friends from "./routes/Friends.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    errorElement: <ErrorBoundary />,
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
        path: "friends",
        element: <Friends />,
        loader: loadFriendsList,
      },
      {
        path: "channels",
        action: createChannel,
      },
      {
        path: "chats",
        element: <Chats />,
        loader: async () => {
          const [chats, users] = await Promise.all([
            loadChatList(),
            loadUsersList(),
          ]);
          return await Promise.all([chats.json(), users.json()]);
        },
        action: createChat,
        children: [
          {
            path: "with/:userId",
            loader: redirectToChat,
          },
          {
            path: "new/:id",
            element: <ChatNew />,
            loader: loadUserById,
          },
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
        loader: loadUserById,
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
