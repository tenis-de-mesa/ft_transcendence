import { createBrowserRouter, redirect } from "react-router-dom";

import Root from "./routes/Root.tsx";
import rootLoader from "./routes/rootLoader.tsx";
import Users from "./routes/users/users.tsx";
import Profile from "./routes/Profile.tsx";

// import ErrorPage from "./error-page.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: "login",
        loader: async () => {
          return redirect("http://localhost:3001/auth/login");
        },
      },
      {
        path: "logout",
        loader: async () => {
          return redirect("http://localhost:3001/auth/logout");
        },
      },
      {
        path: "users",
        element: <Users />,
        loader: async () => {
          return fetch(`http://localhost:3001/users/`);
        },
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },
]);

export default router;
