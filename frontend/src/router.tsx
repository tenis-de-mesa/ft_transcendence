import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import {
  loadRootUser,
  loadUsersList,
  loadChatList,
  loadChat,
  login,
  logout,
  loadFriendsList,
  loadUserById,
  redirectToChat,
  loadAllChats,
} from "./loaders";

import {
  createChannel,
  createChat,
  updateChat,
  sendChatMessage,
  changeChatPassword,
} from "./actions";

import Root from "./routes/Root.tsx";
import Users from "./routes/Users.tsx";
import Profile from "./routes/Profile.tsx";
import Chats from "./routes/Chats.tsx";
import Chat from "./routes/Chat.tsx";
import Home from "./routes/Home.tsx";
import ChatNew from "./routes/ChatNew.tsx";
import Leaderboard from "./routes/Leaderboard.tsx";
import Games from "./routes/Games.tsx";
import Settings from "./routes/Settings.tsx";
import ErrorBoundary from "./routes/ErrorBoundary.tsx";
import Channels from "./routes/Channels.tsx";
import Friends from "./routes/Friends.tsx";
import RequireAuth from "./context/RequireAuth.tsx";
import Login from "./routes/Login.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />,
      <Route path="/login/:provider" loader={login} />,
      <Route path="/logout" loader={logout} />,
      <Route element={<RequireAuth />}>
        {/* Protected routes */}
        <Route
          path="/"
          element={<Root />}
          errorElement={<ErrorBoundary />}
          loader={loadRootUser}
        >
          <Route index element={<Home />} />
          <Route path="users" element={<Users />} loader={loadUsersList} />
          <Route
            path="friends"
            element={<Friends />}
            loader={loadFriendsList}
          />
          <Route
            path="channels"
            element={<Channels />}
            loader={async () => {
              const [chatList, userList] = await Promise.all([
                loadAllChats(),
                loadUsersList(),
              ]);
              return await Promise.all([chatList.json(), userList.json()]);
            }}
          />
          <Route path="newChannel" action={createChannel} />
          <Route
            path="chats"
            element={<Chats />}
            loader={async () => {
              const [chats, users] = await Promise.all([
                loadChatList(),
                loadUsersList(),
              ]);
              return await Promise.all([chats.json(), users.json()]);
            }}
            action={createChat}
          >
            <Route path="with/:userId" loader={redirectToChat} />
            <Route path="new/:id" element={<ChatNew />} loader={loadUserById} />
            <Route
              path=":id"
              element={<Chat />}
              loader={loadChat}
              action={sendChatMessage}
            />
            <Route path="update/:id" action={updateChat} />
            <Route path=":id/change-password" action={changeChatPassword} />
          </Route>
          <Route
            path="profile/:id"
            element={<Profile />}
            loader={loadUserById}
          />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="games" element={<Games />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Route>,
  ),
);

export default router;
