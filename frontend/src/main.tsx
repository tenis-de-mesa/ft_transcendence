import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider, WebSocketContextProvider } from "./contexts";
import router from "./router";
import "./styles/index.css";
import { GameWebSocketContextProvider } from "./contexts/GameWebSocketContext";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(
  // <React.StrictMode>
    <AuthContextProvider>
      <WebSocketContextProvider>
        <GameWebSocketContextProvider>
          <RouterProvider router={router} />
        </GameWebSocketContextProvider>
      </WebSocketContextProvider>
    </AuthContextProvider>
  // </React.StrictMode>
);
