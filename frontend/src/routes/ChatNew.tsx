import { Form, useLoaderData } from "react-router-dom";
import { User } from "../types/types";

export default function ChatNew() {
  const chatUser = useLoaderData() as User;

  return (
    <div className="card">
      <h2>
        <center>
          New chat with <strong>{chatUser.nickname}</strong>
        </center>
      </h2>
      <Form method="POST" action="/chats" className="messageInput">
        <input type="hidden" name="users[]" value={chatUser.id} />
        <input type="text" name="message" className="bg-gray-500" />
        <button type="submit" hidden>
          Create Chat
        </button>
      </Form>
    </div>
  );
}
