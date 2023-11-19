import { ActionFunctionArgs } from "react-router-dom";
import { socket } from "../socket";
import { NewChatMessage } from "../types";

export async function sendChatMessage({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const chatId = params.id;

  if (!message) {
    return null;
  }

  if (!chatId) {
    console.error("Missing Chat ID or message");
    return null;
  }

  const body: NewChatMessage = {
    chatId: parseInt(chatId),
    message: message,
  };

  socket.emit("sendChatMessage", body);
  return null;
}
