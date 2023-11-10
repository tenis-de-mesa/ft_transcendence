import { createContext, useEffect, useState } from "react";
import { Chat } from "../types";
import { useLoaderData } from "react-router-dom";

type ChatContextType = {
  currentChat: Chat;
  setCurrentChat: React.Dispatch<React.SetStateAction<Chat>>;
  chatList: Chat[];
  setChatList: React.Dispatch<React.SetStateAction<Chat[]>>;
};

export const ChatContext = createContext({} as ChatContextType);

export const ChatContextProvider = ({ children }) => {
  const loaderData = useLoaderData() as Chat[];
  const [chatList, setChatList] = useState(loaderData);
  const [currentChat, setCurrentChat] = useState(null);

  useEffect(() => {
    setChatList(loaderData);
  }, [loaderData]);

  return (
    <ChatContext.Provider
      value={{ currentChat, setCurrentChat, chatList, setChatList }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
