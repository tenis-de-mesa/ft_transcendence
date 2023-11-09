import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";

import {
  loadUsersList,
  loadChatList,
  loadChat,
  providerLogin,
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

import { RequireAuth } from "./contexts";

import {
  Root,
  Users,
  Profile,
  Chats,
  Chat,
  Home,
  ChatNew,
  Leaderboard,
  Game,
  Settings,
  ErrorBoundary,
  Channels,
  Friends,
  Login,
} from "./routes";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />,
      <Route path="/login/:provider" loader={providerLogin} />,
      <Route path="/logout" loader={logout} />,
      <Route element={<RequireAuth />}>
        {/* Protected routes */}
        <Route path="/" element={<Root />} errorElement={<ErrorBoundary />}>
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
          <Route path="games/:gameId" element={<Game />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
    </Route>
  )
);

export default router;
