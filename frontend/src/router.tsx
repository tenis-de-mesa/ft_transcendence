import { createBrowserRouter } from "react-router-dom";

import Root from "./routes/root.tsx";
import rootLoader from "./routes/rootLoader.tsx";
import { loader as loginLoader } from "./routes/login.tsx";
import { loader as logoutLoader } from "./routes/logout.tsx";
import Users from "./routes/users/users.tsx";

// import ErrorPage from "./error-page.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    children: [
      {
        path: "login",
        loader: loginLoader,
      },
      {
        path: "logout",
        loader: logoutLoader,
      },
      {
        path: "users",
        element: <Users />,
        loader: async ({}) => {
          console.log("fetching users");
          return fetch(`http://localhost:3001/users/`);
        },
      },
    ],
  },
]);

export default router;
