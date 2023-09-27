import { createBrowserRouter, redirect } from "react-router-dom";
import { getCurrentUser, getUsers } from "./loaders";

// Routes
import Root from "./routes/Root.tsx";
import Users from "./routes/Users.tsx";
import Profile from "./routes/Profile.tsx";

// loaders are used to fetch data BEFORE rendering the route,
// so they are called only once, and before the component is rendered
const router = createBrowserRouter([
  {
    path: "/",
    id: "root",
    element: <Root />,
    loader: getCurrentUser,
    children: [
      {
        path: "users",
        element: <Users />,
        loader: getUsers,
      },
      {
        path: "profile/:id",
        element: <Profile />,
      },
    ],
  },
  {
    path: "/login/:provider",
    loader: ({ params }) => {
      return redirect(`http://localhost:3001/auth/login/${params.provider}`);
    },
  },
  {
    path: "/logout",
    loader: () => {
      return redirect("http://localhost:3001/auth/logout");
    },
  },
]);

export default router;
