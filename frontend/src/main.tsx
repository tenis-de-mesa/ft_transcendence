import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthContextProvider, WebSocketContextProvider } from "./contexts";
import router from "./router";
import "./styles/index.css";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement!).render(
  //<React.StrictMode>
  <AuthContextProvider>
    <WebSocketContextProvider>
      <RouterProvider router={router} />
    </WebSocketContextProvider>
  </AuthContextProvider>,
  //</React.StrictMode>,
);
