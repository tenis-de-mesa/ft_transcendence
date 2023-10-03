import { Chat } from "../types/types";
import "./Chat.css";

import { Outlet, useLoaderData } from "react-router-dom";

export default function Chats() {
  const chats = useLoaderData() as Chat[];

  return (
    <div className="chat">
      <div className="card">
        <center>
          <h3>Chats</h3>
        </center>
        {chats.map((chat) => (
          <div key={chat.id}>
            <a href={`/chats/${chat.id}`}>
              [{chat.id}] - {chat.name}
            </a>
            <hr />
          </div>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
