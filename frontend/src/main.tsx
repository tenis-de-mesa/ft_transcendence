import React from "react";
import ReactDOM from "react-dom/client";
import ErrorPage from "./error-page.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./pages/App.tsx";
import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <RouterProvider router={router} />
  // </React.StrictMode>
);
