import { createBrowserRouter } from "react-router-dom";

// import ErrorPage from "./error-page.tsx";
import Root, { loader as rootLoader, action as rootAction } from "./routes/root";
import Cat, { loader as catLoader } from "./cats/cat";
import EditCat, { action as EditAction } from "./cats/edit";
import { action as destroyAction } from "./cats/destroy";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    loader: rootLoader,
    action: rootAction,
    children: [
      {
        path: "/cats/:id",
        element: <Cat />,
        loader: catLoader,
      },
      {
        path: "/cats/:id/destroy",
        action: destroyAction,
      },
      {
        path: "cats/:id/edit",
        element: <EditCat />,
        loader: catLoader,
        action: EditAction,
      },
    ],
  },
]);

export default router;
