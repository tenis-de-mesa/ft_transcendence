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
  generateTFASecret,
  loadGame,
  loadGames,
  loadNewChat,
} from "./loaders";

import {
  createChannel,
  createChat,
  updateChat,
  deleteChat,
  sendChatMessage,
  joinChannel,
  leaveChannel,
  kickChatMember,
  muteChatMember,
  unmuteChatMember,
  banChatMember,
  unbanChatMember,
  updateChatMemberRole,
  enableTFA,
  disableTFA,
  regenerateTFACodes,
  loginTFACheck,
  loginTFARecover,
  manageChannelPassword,
} from "./actions";

import { RequireAuth, ChatContextProvider } from "./contexts";

import {
  Root,
  Users,
  Profile,
  Chats,
  Chat,
  Home,
  ChatNew,
  Leaderboard,
  Settings,
  ErrorBoundary,
  Channels,
  Friends,
  Login,
  EnableTFA,
  DisableTFA,
  RegenerateTFACodes,
  LoginTFACheck,
  LoginTFARecover,
  Games,
  Game,
} from "./routes";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />,
      <Route
        path="/login/tfa-check"
        element={<LoginTFACheck />}
        action={loginTFACheck}
      />
      <Route
        path="/login/tfa-recover"
        element={<LoginTFARecover />}
        action={loginTFARecover}
      />
      ,
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
            loader={loadAllChats}
            action={createChannel}
          >
            <Route path=":id/join" action={joinChannel} />
            <Route path=":id/leave" action={leaveChannel} />
          </Route>
          <Route path="newChannel" action={createChannel} />
          <Route
            path="chats"
            element={<ChatContextProvider children={<Chats />} />}
            loader={loadChatList}
            action={createChat}
          >
            <Route path="with/:userId" loader={redirectToChat} />
            <Route
              path="new/:userId"
              element={<ChatNew />}
              loader={loadNewChat}
            />
            <Route
              path=":id"
              element={<Chat />}
              loader={loadChat}
              action={sendChatMessage}
            />
            <Route path="update/:id" action={updateChat} />
            <Route path=":id/manage-password" action={manageChannelPassword} />
            <Route path=":id/kick" action={kickChatMember} />
            <Route path=":id/mute" action={muteChatMember} />
            <Route path=":id/unmute" action={unmuteChatMember} />
            <Route path=":id/ban" action={banChatMember} />
            <Route path=":id/unban" action={unbanChatMember} />
            <Route path=":id/leave" action={leaveChannel} />
            <Route path=":id/delete" action={deleteChat} />
            <Route
              path=":id/update-member-role"
              action={updateChatMemberRole}
            />
          </Route>
          <Route
            path="profile/:userId"
            element={<Profile />}
            loader={loadUserById}
          />
          <Route
            path="leaderboard"
            element={<Leaderboard />}
            loader={loadUsersList}
          />
          <Route path="games" element={<Games />} loader={loadGames} />
          <Route path="games/:id" element={<Game />} loader={loadGame} />
          <Route path="settings" element={<Settings />} />
          <Route path="tfa" index={false}>
            <Route
              path="enable"
              loader={generateTFASecret}
              action={enableTFA}
              element={<EnableTFA />}
              shouldRevalidate={() => false}
            />
            <Route
              path="disable"
              action={disableTFA}
              element={<DisableTFA />}
            />
            <Route
              path="regenerate-codes"
              action={regenerateTFACodes}
              element={<RegenerateTFACodes />}
            />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<ErrorBoundary />} />
    </Route>,
  ),
);

export default router;
