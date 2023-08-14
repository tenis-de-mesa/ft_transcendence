import { createBrowserRouter } from "react-router-dom";

import Root, { loader as RootLoader } from "./routes/root.tsx";
import { loader as loginLoader } from "./routes/login.tsx";
import { loader as logoutLoader } from "./routes/logout.tsx";

// import ErrorPage from "./error-page.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: RootLoader,
    children: [
      {
        path: "login",
        loader: loginLoader,
      },
      {
        path: "logout",
        loader: logoutLoader,
      },
    ],
  },
]);

export default router;
