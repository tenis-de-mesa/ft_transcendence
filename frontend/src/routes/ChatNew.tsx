import { Form, useLoaderData } from "react-router-dom";
import { User } from "../types/types";
import { Card } from "../components/Card";
import { Typography } from "../components/Typography";
import { Input } from "../components/Input";
import { useState } from "react";

export default function ChatNew() {
  const [message, setMessage] = useState("");

  const chatUser = useLoaderData() as User;

  return (
    <Card className="h-full">
      <Card.Title>
        <Typography variant="h6">
          New chat with <strong>{chatUser.nickname}</strong>
        </Typography>
      </Card.Title>
      <Card.Body position="left" className="flex flex-col justify-between h-[calc(100%-4rem)]">
        <>
          <div></div>
          <div>
            <Form method="POST" action="/chats">
              <input type="hidden" name="users[]" value={chatUser.id} />
              <Input type="text" name="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Enter your message" />
              <button type="submit" hidden>
                <Typography variant="sm">
                  Create Chat
                </Typography>
              </button>
            </Form>
          </div>
        </>
      </Card.Body>
    </Card>
  );
}
