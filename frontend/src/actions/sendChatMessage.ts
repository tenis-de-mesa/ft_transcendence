import { ActionFunctionArgs } from "react-router-dom";
import { socket } from "../socket";
import { NewChatMessage } from "../types/types";

export async function sendChatMessage({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData();
  const message = formData.get("message") as string;
  const chatId = params.id;

  if (!chatId || !message) {
    return console.error("Missing Chat ID or message");
  }

  const body: NewChatMessage = {
    chatId: parseInt(chatId),
    message: message,
  };

  socket.emit("sendChatMessage", body);
  return null;
}
