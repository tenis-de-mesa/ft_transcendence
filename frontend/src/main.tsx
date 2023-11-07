import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider } from "./context/AuthContext";
import router from "./router";
import "./styles/index.css";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <AuthContextProvider>
      <RouterProvider router={router} />
    </AuthContextProvider>
  </React.StrictMode>
);
